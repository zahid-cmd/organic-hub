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
    public class SubCategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SubCategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.SubCategories
                .Include(s => s.Category)
                .ThenInclude(c => c.ProductType)
                .OrderBy(s => s.SubCategoryName)
                .Select(s => new
                {
                    s.Id,
                    s.SubCategoryCode,
                    s.SubCategoryName,
                    s.CategoryId,
                    CategoryName = s.Category!.CategoryName,
                    CategoryCode = s.Category.CategoryCode,
                    ProductTypeName = s.Category.ProductType!.TypeName,
                    s.Status,
                    s.Remarks,
                    s.CreatedBy,
                    s.CreatedDate,
                    s.UpdatedBy,
                    s.UpdatedDate
                })
                .ToListAsync();

            return Ok(list);
        }

        // =====================================================
        // 🔥 GET BY CATEGORY (REQUIRED FOR PRODUCT FORM)
        // =====================================================
        [HttpGet("by-category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var list = await _context.SubCategories
                .Where(s => s.CategoryId == categoryId)
                .OrderBy(s => s.SubCategoryName)
                .Select(s => new
                {
                    s.Id,
                    s.SubCategoryCode,
                    s.SubCategoryName,
                    s.CategoryId,
                    s.Status
                })
                .ToListAsync();

            return Ok(list);
        }

        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _context.SubCategories
                .Include(s => s.Category)
                .ThenInclude(c => c.ProductType)
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.SubCategoryCode,
                    s.SubCategoryName,
                    s.CategoryId,
                    CategoryName = s.Category!.CategoryName,
                    CategoryCode = s.Category.CategoryCode,
                    ProductTypeName = s.Category.ProductType!.TypeName,
                    s.Status,
                    s.Remarks,
                    s.CreatedBy,
                    s.CreatedDate,
                    s.UpdatedBy,
                    s.UpdatedDate
                })
                .FirstOrDefaultAsync();

            if (entity == null)
                return NotFound("Sub Category not found.");

            return Ok(entity);
        }

        // =====================================================
        // GET NEXT CODE
        // =====================================================
        [HttpGet("next-code/{categoryId}")]
        public async Task<IActionResult> GetNextCode(int categoryId)
        {
            var code = await GenerateSubCategoryCode(categoryId);
            return Ok(code);
        }

        // =====================================================
        // CREATE
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(CreateSubCategoryRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var category = await _context.Categories
                .Include(c => c.ProductType)
                .FirstOrDefaultAsync(c => c.Id == request.CategoryId);

            if (category == null)
                return BadRequest("Invalid Category.");

            var code = await GenerateSubCategoryCode(request.CategoryId);

            var entity = new SubCategory
            {
                SubCategoryCode = code,
                SubCategoryName = request.SubCategoryName.Trim(),
                CategoryId = request.CategoryId,
                Status = request.Status ?? "Active",
                Remarks = request.Remarks,
                CreatedBy = "System",
                CreatedDate = DateTime.UtcNow
            };

            _context.SubCategories.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(entity);
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateSubCategoryRequest request)
        {
            var entity = await _context.SubCategories.FindAsync(id);

            if (entity == null)
                return NotFound("Sub Category not found.");

            entity.SubCategoryName = request.SubCategoryName.Trim();
            entity.CategoryId = request.CategoryId;
            entity.Status = request.Status ?? "Active";
            entity.Remarks = request.Remarks;
            entity.UpdatedBy = "System";
            entity.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(entity);
        }

        // =====================================================
        // DELETE (HARD DELETE – CURRENT DESIGN)
        // =====================================================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.SubCategories
                .Include(s => s.Products)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (entity == null)
                return NotFound("Sub Category not found.");

            if (entity.Products.Any())
                return BadRequest("Cannot delete Sub Category with products.");

            _context.SubCategories.Remove(entity);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Sub Category deleted successfully." });
        }

        // =====================================================
        // CODE GENERATOR
        // =====================================================
        private async Task<string> GenerateSubCategoryCode(int categoryId)
        {
            var category = await _context.Categories
                .Include(c => c.ProductType)
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null)
                throw new Exception("Category not found.");

            var ptMatch = Regex.Match(category.ProductType!.TypeCode ?? "", @"\d+");
            var productTypeNumber = ptMatch.Success
                ? ptMatch.Value.PadLeft(3, '0')
                : "000";

            var parts = category.CategoryCode.Split('-');
            var categoryNumber = parts.Length >= 3
                ? parts[2].PadLeft(3, '0')
                : "000";

            var existingCodes = await _context.SubCategories
                .Where(s => s.CategoryId == categoryId)
                .Select(s => s.SubCategoryCode)
                .ToListAsync();

            if (!existingCodes.Any())
                return $"SC-{productTypeNumber}-{categoryNumber}-001";

            var numbers = existingCodes
                .Select(code =>
                {
                    var p = code.Split('-');
                    return p.Length == 4 && int.TryParse(p[3], out int n) ? n : 0;
                });

            var max = numbers.Any() ? numbers.Max() : 0;

            return $"SC-{productTypeNumber}-{categoryNumber}-{(max + 1).ToString("D3")}";
        }
    }
}
