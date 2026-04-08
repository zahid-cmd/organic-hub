using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.ProductManagement;
using OrganicHub.Api.DTOs.ProductManagement;

namespace OrganicHub.Api.Controllers.ProductManagement
{
    [ApiController]
    [Route("api/product-sale-price")]
    public class ProductSalePriceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductSalePriceController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL CURRENT PRICES
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var prices = await _context.ProductSalePrices
                .Include(p => p.Product)
                .Where(p => p.EffectiveTo == null) // current active price
                .Select(p => new
                {
                    Id = p.Id,
                    ProductId = p.ProductId,
                    ProductName = p.Product.ProductName,
                    CurrentPrice = p.Price,
                    Status = p.Status,
                    EffectiveFrom = p.EffectiveFrom
                })
                .ToListAsync();

            var result = new List<object>();

            foreach (var item in prices)
            {
                var previous = await _context.ProductSalePrices
                    .Where(x => x.ProductId == item.ProductId &&
                                x.EffectiveTo != null)
                    .OrderByDescending(x => x.EffectiveTo)
                    .FirstOrDefaultAsync();

                result.Add(new
                {
                    id = item.Id,
                    productId = item.ProductId,
                    productName = item.ProductName,
                    price = item.CurrentPrice,
                    oldPrice = previous != null ? previous.Price : 0,
                    status = item.Status,
                    effectiveFrom = item.EffectiveFrom
                });
            }

            return Ok(result);
        }

        // =====================================================
        // GET CURRENT PRICE BY PRODUCT
        // =====================================================
        [HttpGet("current/{productId}")]
        public async Task<IActionResult> GetCurrentPrice(long productId)
        {
            if (productId <= 0)
                return BadRequest("Invalid product.");

            var price = await _context.ProductSalePrices
                .Where(p => p.ProductId == productId && p.IsCurrent)
                .FirstOrDefaultAsync();

            return Ok(price);
        }

        // =====================================================
        // GET PRICE HISTORY
        // =====================================================
        [HttpGet("history/{productId}")]
        public async Task<IActionResult> GetProductSalePriceHistory(long productId)
        {
            var historyData = await _context.ProductSalePrices
                .Where(p => p.ProductId == productId)
                .OrderByDescending(p => p.EffectiveFrom)
                .ToListAsync();

            var result = new List<object>();

            for (int i = 0; i < historyData.Count; i++)
            {
                var current = historyData[i];

                var oldPrice = (i < historyData.Count - 1)
                    ? historyData[i + 1].Price
                    : 0;

                result.Add(new
                {
                    newPrice = current.Price,
                    oldPrice = oldPrice,
                    effectiveFrom = current.EffectiveFrom,
                    remarks = current.Remarks,
                    createdBy = current.CreatedBy,
                    isCurrent = current.IsCurrent
                });
            }

            return Ok(result);
        }

        // =====================================================
        // SET / UPDATE PRICE (VERSIONED)
        // =====================================================
        [HttpPost("set")]
        public async Task<IActionResult> SetPrice([FromBody] ProductSalePriceSetDto request)
        {
            if (request == null)
                return BadRequest("Invalid request.");

            if (request.ProductId <= 0)
                return BadRequest("Invalid product.");

            if (request.Price <= 0)
                return BadRequest("Invalid price.");

            // 🔍 Ensure product exists (Prevents FK 500 crash)
            var productExists = await _context.Products
                .AnyAsync(p => p.Id == request.ProductId);

            if (!productExists)
                return BadRequest("Selected product does not exist.");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var existing = await _context.ProductSalePrices
                    .Where(p => p.ProductId == request.ProductId && p.IsCurrent)
                    .FirstOrDefaultAsync();

                // Prevent saving same price
                if (existing != null && existing.Price == request.Price)
                {
                    return BadRequest("New price must be different from current price.");
                }

                // Deactivate existing
                if (existing != null)
                {
                    existing.IsCurrent = false;
                    existing.EffectiveTo = DateTime.UtcNow;
                    existing.UpdatedAt = DateTime.UtcNow;
                    existing.UpdatedBy = "ERP";

                    _context.ProductSalePrices.Update(existing);
                    await _context.SaveChangesAsync();
                }

                // Insert new version
                var newPrice = new ProductSalePrice
                {
                    ProductId = request.ProductId,
                    Price = request.Price,
                    Status = string.IsNullOrWhiteSpace(request.Status)
                                ? "Active"
                                : request.Status,
                    IsCurrent = true,
                    EffectiveFrom = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "ERP"
                };

                await _context.ProductSalePrices.AddAsync(newPrice);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { message = "Price updated successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }
    }
}