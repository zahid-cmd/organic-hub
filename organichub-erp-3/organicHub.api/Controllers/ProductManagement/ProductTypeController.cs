using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.ProductManagement;
using OrganicHub.Api.DTOs.ProductManagement;
using OrganicHub.Api.Controllers.Base;

namespace OrganicHub.Api.Controllers.ProductManagement
{
    [Route("api/[controller]")]
    public class ProductTypeController : ErpControllerBase
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
            var entity = await _context.ProductTypes
                .FirstOrDefaultAsync(p => p.Id == id);

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

            if (string.IsNullOrWhiteSpace(request.TypeName))
                return BadRequest("Type Name is required.");

            var code = await GenerateProductTypeCode();

            var entity = new ProductType
            {
                TypeCode = code,
                TypeName = request.TypeName.Trim(),
                Status = string.IsNullOrWhiteSpace(request.Status)
                            ? "Active"
                            : request.Status.Trim(),
                Remarks = request.Remarks,

                // Business Behaviour Flags
                IsPurchasable = request.IsPurchasable,
                IsSellable = request.IsSellable,
                IsProductionItem = request.IsProductionItem,

                CreatedBy = CurrentUsername,
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
        // GET BY CATEGORY ⭐ REQUIRED FOR INVENTORY TREE
        // =====================================================
        [HttpGet("by-category/{categoryId:int}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var list = await _context.SubCategories
                .AsNoTracking()
                .Where(s => s.CategoryId == categoryId)
                .OrderBy(s => s.SubCategoryName)
                .Select(s => new
                {
                    id = s.Id,
                    subCategoryCode = s.SubCategoryCode,
                    subCategoryName = s.SubCategoryName
                })
                .ToListAsync();

            return Ok(list);
        }
        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateProductTypeRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entity = await _context.ProductTypes
                .FirstOrDefaultAsync(p => p.Id == id);

            if (entity == null)
                return NotFound("Product Type not found.");

            if (string.IsNullOrWhiteSpace(request.TypeName))
                return BadRequest("Type Name is required.");

            entity.TypeName = request.TypeName.Trim();
            entity.Status = string.IsNullOrWhiteSpace(request.Status)
                                ? "Active"
                                : request.Status.Trim();
            entity.Remarks = request.Remarks;

            // Business Behaviour Flags
            entity.IsPurchasable = request.IsPurchasable;
            entity.IsSellable = request.IsSellable;
            entity.IsProductionItem = request.IsProductionItem;

            entity.UpdatedBy = CurrentUsername;
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