using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.DTOs;
using OrganicHub.Api.Models;
using System.Text.RegularExpressions;

namespace OrganicHub.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL (SOFT DELETE FILTER ENFORCED)
        // =====================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAll()
        {
            var products = await _context.Products
                .Where(p => !p.IsDeleted)
                .Include(p => p.ProductType)
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Unit)
                .Select(p => new ProductResponse
                {
                    Id = p.Id,
                    ProductCode = p.ProductCode,
                    SKU = p.SKU,
                    Barcode = p.Barcode,
                    ProductName = p.ProductName,

                    ProductTypeId = p.ProductTypeId,
                    ProductTypeName = p.ProductType!.TypeName,

                    CategoryId = p.CategoryId,
                    CategoryName = p.Category!.CategoryName,

                    SubCategoryId = p.SubCategoryId,
                    SubCategoryName = p.SubCategory!.SubCategoryName,

                    UnitId = p.UnitId,
                    UnitName = p.Unit!.UnitName,

                    Status = p.Status,
                    Remarks = p.Remarks,

                    CreatedBy = p.CreatedBy,
                    CreatedDate = p.CreatedDate,
                    UpdatedBy = p.UpdatedBy,
                    UpdatedDate = p.UpdatedDate
                })
                .ToListAsync();

            return Ok(products);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductResponse>> GetById(int id)
        {
            var p = await _context.Products
                .Where(p => !p.IsDeleted && p.Id == id)
                .Include(p => p.ProductType)
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Unit)
                .FirstOrDefaultAsync();

            if (p == null)
                return NotFound("Product not found.");

            return Ok(new ProductResponse
            {
                Id = p.Id,
                ProductCode = p.ProductCode,
                SKU = p.SKU,
                Barcode = p.Barcode,
                ProductName = p.ProductName,

                ProductTypeId = p.ProductTypeId,
                ProductTypeName = p.ProductType?.TypeName,

                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,

                SubCategoryId = p.SubCategoryId,
                SubCategoryName = p.SubCategory?.SubCategoryName,

                UnitId = p.UnitId,
                UnitName = p.Unit?.UnitName,

                Status = p.Status,
                Remarks = p.Remarks,

                CreatedBy = p.CreatedBy,
                CreatedDate = p.CreatedDate,
                UpdatedBy = p.UpdatedBy,
                UpdatedDate = p.UpdatedDate
            });
        }

        // =====================================================
        // GET NEXT PRODUCT CODE
        // =====================================================
        [HttpGet("next-code/{subCategoryId}")]
        public async Task<IActionResult> GetNextCode(int subCategoryId)
        {
            var code = await GenerateProductCode(subCategoryId);
            return Ok(code);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(ProductRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 🔒 Integrity check
            var subCategory = await _context.SubCategories
                .Include(s => s.Category)
                .ThenInclude(c => c.ProductType)
                .FirstOrDefaultAsync(s => s.Id == request.SubCategoryId);

            if (subCategory == null)
                return BadRequest("Invalid Sub Category.");

            if (subCategory.CategoryId != request.CategoryId ||
                subCategory.Category!.ProductTypeId != request.ProductTypeId)
                return BadRequest("Invalid category hierarchy.");

            var productCode = await GenerateProductCode(request.SubCategoryId);

            var product = new Product
            {
                ProductCode = productCode,
                ProductName = request.ProductName.Trim(),
                SKU = request.SKU,
                Barcode = request.Barcode,
                ProductTypeId = request.ProductTypeId,
                CategoryId = request.CategoryId,
                SubCategoryId = request.SubCategoryId,
                UnitId = request.UnitId,
                Status = request.Status ?? "Active",
                Remarks = request.Remarks,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(product);
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ProductRequest request)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => !p.IsDeleted && p.Id == id);

            if (product == null)
                return NotFound("Product not found.");

            product.ProductName = request.ProductName.Trim();
            product.SKU = request.SKU;
            product.Barcode = request.Barcode;
            product.ProductTypeId = request.ProductTypeId;
            product.CategoryId = request.CategoryId;
            product.SubCategoryId = request.SubCategoryId;
            product.UnitId = request.UnitId;
            product.Status = request.Status ?? "Active";
            product.Remarks = request.Remarks;
            product.UpdatedBy = "System";
            product.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(product);
        }

        // =====================================================
        // SOFT DELETE
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => !p.IsDeleted && p.Id == id);

            if (product == null)
                return NotFound("Product not found.");

            product.IsDeleted = true;
            product.UpdatedBy = "System";
            product.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Product deleted successfully." });
        }

        // =====================================================
        // AUTO CODE GENERATOR (SOFT DELETE SAFE)
        // =====================================================
        private async Task<string> GenerateProductCode(int subCategoryId)
        {
            var subCategory = await _context.SubCategories
                .Include(s => s.Category)
                .ThenInclude(c => c.ProductType)
                .FirstOrDefaultAsync(s => s.Id == subCategoryId);

            if (subCategory == null)
                throw new Exception("Invalid Sub Category.");

            var typeNumber = Regex.Match(
                subCategory.Category!.ProductType!.TypeCode, @"\d+"
            ).Value.PadLeft(3, '0');

            var categoryParts = subCategory.Category.CategoryCode.Split('-');
            var categoryNumber = categoryParts.Length >= 3
                ? categoryParts[2].PadLeft(3, '0')
                : "000";

            var subParts = subCategory.SubCategoryCode.Split('-');
            var subNumber = subParts.Length >= 4
                ? subParts[3].PadLeft(3, '0')
                : "000";

            var existing = await _context.Products
                .Where(p => !p.IsDeleted && p.SubCategoryId == subCategoryId)
                .Select(p => p.ProductCode)
                .ToListAsync();

            if (!existing.Any())
                return $"P-{typeNumber}-{categoryNumber}-{subNumber}-0001";

            var numbers = existing
                .Select(code =>
                {
                    var parts = code.Split('-');
                    return parts.Length == 5 &&
                           int.TryParse(parts[4], out int n) ? n : 0;
                });

            var max = numbers.Any() ? numbers.Max() : 0;

            return $"P-{typeNumber}-{categoryNumber}-{subNumber}-{(max + 1):D4}";
        }
    }
}
