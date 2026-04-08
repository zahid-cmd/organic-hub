using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models;
using OrganicHub.Api.DTOs;

namespace OrganicHub.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductTypeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductTypeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.ProductTypes
                .OrderBy(p => p.TypeName)
                .ToListAsync();

            return Ok(list);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _context.ProductTypes.FindAsync(id);

            if (entity == null)
                return NotFound("Product Type not found.");

            return Ok(entity);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(CreateProductTypeRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var code = await GenerateProductTypeCode();

            var entity = new ProductType
            {
                TypeCode = code,
                TypeName = request.TypeName.Trim(),
                Status = request.Status ?? "Active",
                Remarks = request.Remarks,

                // ✅ Business Behaviour Only
                IsPurchasable = request.IsPurchasable,
                IsSellable = request.IsSellable,
                IsProductionItem = request.IsProductionItem,

                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow
            };

            _context.ProductTypes.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product Type created successfully.",
                entity
            });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateProductTypeRequest request)
        {
            var entity = await _context.ProductTypes.FindAsync(id);

            if (entity == null)
                return NotFound("Product Type not found.");

            entity.TypeName = request.TypeName.Trim();
            entity.Status = request.Status ?? "Active";
            entity.Remarks = request.Remarks;

            // ✅ Business Behaviour Only
            entity.IsPurchasable = request.IsPurchasable;
            entity.IsSellable = request.IsSellable;
            entity.IsProductionItem = request.IsProductionItem;

            entity.UpdatedBy = "System";
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Product Type updated successfully.",
                entity
            });
        }

        // =====================================================
        // DELETE
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.ProductTypes
                .Include(p => p.Products)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (entity == null)
                return NotFound("Product Type not found.");

            if (entity.Products.Any())
                return BadRequest("Cannot delete Product Type with linked products.");

            _context.ProductTypes.Remove(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product Type deleted successfully." });
        }

        // =====================================================
        // AUTO CODE → PT-001
        // =====================================================
        private async Task<string> GenerateProductTypeCode()
        {
            var existingCodes = await _context.ProductTypes
                .Select(p => p.TypeCode)
                .ToListAsync();

            if (!existingCodes.Any())
                return "PT-001";

            var numbers = existingCodes
                .Where(code => code.StartsWith("PT-"))
                .Select(code =>
                {
                    var part = code.Replace("PT-", "");
                    return int.TryParse(part, out int n) ? n : 0;
                });

            var max = numbers.Any() ? numbers.Max() : 0;

            return $"PT-{(max + 1).ToString("D3")}";
        }
    }
}
