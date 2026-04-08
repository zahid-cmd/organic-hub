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
    public class CategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories
                .Include(c => c.ProductType)
                .OrderBy(c => c.CategoryName)
                .Select(c => new
                {
                    c.Id,
                    c.CategoryCode,
                    c.CategoryName,

                    c.ProductTypeId,
                    ProductTypeCode = c.ProductType!.TypeCode,     // ✅ FIXED
                    ProductTypeName = c.ProductType!.TypeName,

                    c.Status,
                    c.Remarks,
                    c.CreatedBy,
                    c.CreatedDate,
                    c.UpdatedBy,
                    c.UpdatedDate
                })
                .ToListAsync();

            return Ok(categories);
        }

        // =====================================================
        // GET BY ID
        // =====================================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.Categories
                .Include(c => c.ProductType)
                .Where(c => c.Id == id)
                .Select(c => new
                {
                    c.Id,
                    c.CategoryCode,
                    c.CategoryName,

                    c.ProductTypeId,
                    ProductTypeCode = c.ProductType!.TypeCode,     // ✅ FIXED
                    ProductTypeName = c.ProductType!.TypeName,

                    c.Status,
                    c.Remarks,
                    c.CreatedBy,
                    c.CreatedDate,
                    c.UpdatedBy,
                    c.UpdatedDate
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return NotFound("Category not found.");

            return Ok(category);
        }

        // =====================================================
        // GET NEXT CATEGORY CODE
        // =====================================================

        [HttpGet("next-code/{productTypeId}")]
        public async Task<IActionResult> GetNextCode(int productTypeId)
        {
            var code = await GenerateCategoryCode(productTypeId);
            return Ok(code);
        }

        // =====================================================
        // CREATE
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> Create(CreateCategoryRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var productType = await _context.ProductTypes
                .FirstOrDefaultAsync(p => p.Id == request.ProductTypeId);

            if (productType == null)
                return BadRequest("Invalid Product Type.");

            var code = await GenerateCategoryCode(request.ProductTypeId);

            var category = new Category
            {
                CategoryCode = code,
                CategoryName = request.CategoryName.Trim(),
                ProductTypeId = request.ProductTypeId,
                Status = request.Status ?? "Active",
                Remarks = request.Remarks,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }

        // =====================================================
        // UPDATE
        // =====================================================

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateCategoryRequest request)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
                return NotFound("Category not found.");

            category.CategoryName = request.CategoryName.Trim();
            category.ProductTypeId = request.ProductTypeId;
            category.Status = request.Status ?? "Active";
            category.Remarks = request.Remarks;
            category.UpdatedBy = "System";
            category.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(category);
        }

        // =====================================================
        // DELETE
        // =====================================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories
                .Include(c => c.SubCategories)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound("Category not found.");

            if (category.SubCategories.Any())
                return BadRequest("Cannot delete category with subcategories.");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category deleted successfully." });
        }

        // =====================================================
        // AUTO CODE GENERATOR
        // FORMAT: MC-001-001
        // =====================================================

        private async Task<string> GenerateCategoryCode(int productTypeId)
        {
            var productType = await _context.ProductTypes
                .FirstOrDefaultAsync(p => p.Id == productTypeId);

            if (productType == null)
                throw new Exception("Product Type not found.");

            var match = Regex.Match(productType.TypeCode, @"\d+");

            if (!match.Success)
                throw new Exception("Invalid Product Type Code format.");

            var typeNumber = match.Value.PadLeft(3, '0');

            var existingCodes = await _context.Categories
                .Where(c => c.ProductTypeId == productTypeId)
                .Select(c => c.CategoryCode)
                .ToListAsync();

            if (!existingCodes.Any())
                return $"MC-{typeNumber}-001";

            var numbers = existingCodes
                .Where(code => code.StartsWith($"MC-{typeNumber}-"))
                .Select(code =>
                {
                    var parts = code.Split('-');
                    return parts.Length == 3 && int.TryParse(parts[2], out int n) ? n : 0;
                });

            var max = numbers.Any() ? numbers.Max() : 0;

            return $"MC-{typeNumber}-{(max + 1).ToString("D3")}";
        }
    }
}
