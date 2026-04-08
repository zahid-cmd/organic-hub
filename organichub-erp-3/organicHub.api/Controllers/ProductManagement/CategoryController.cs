using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.ProductManagement;
using OrganicHub.Api.DTOs.ProductManagement;
using OrganicHub.Api.Controllers.Base;
using System.Text.RegularExpressions;
using OrganicHub.Api.Models.AccountSetup;

namespace OrganicHub.Api.Controllers.ProductManagement
{
    [Route("api/[controller]")]
    public class CategoryController : ErpControllerBase
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
                    ProductTypeCode = c.ProductType!.TypeCode,
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
        // GET BY ID ⭐ VERY IMPORTANT FOR EDIT SCREEN
        // =====================================================
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.Categories
                .Include(c => c.ProductType)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound("Category not found.");

            return Ok(new
            {
                category.Id,
                category.CategoryCode,
                category.CategoryName,
                category.ProductTypeId,
                ProductTypeCode = category.ProductType!.TypeCode,
                ProductTypeName = category.ProductType!.TypeName,
                category.Status,
                category.Remarks,
                category.CreatedBy,
                category.CreatedDate,
                category.UpdatedBy,
                category.UpdatedDate
            });
        }
        // =====================================================
        // GET NEXT CODE
        // =====================================================
        [HttpGet("next-code/{productTypeId}")]
        public async Task<IActionResult> GetNextCode(int productTypeId)
        {
            var code = await GenerateCategoryCode(productTypeId);
            return Ok(code);
        }

        // =====================================================
        // CREATE CATEGORY + AUTO ACCOUNT GROUP
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(CreateCategoryRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                var productType = await _context.ProductTypes
                    .FirstOrDefaultAsync(p => p.Id == request.ProductTypeId);

                if (productType == null)
                    return BadRequest("Invalid Product Type.");

                var username = string.IsNullOrWhiteSpace(CurrentUsername)
                    ? "SYSTEM"
                    : CurrentUsername;

                var code = await GenerateCategoryCode(request.ProductTypeId);

                var suffix = code.Substring(code.IndexOf('-') + 1);

                var finalStatus = request.Status ?? "Active";

                // ===== LOAD ACCOUNT CLASSES =====
                var inventoryClass = await _context.AccountClasses
                    .FirstAsync(c => c.ClassCode == "CLS-06");

                var cogsClass = await _context.AccountClasses
                    .FirstAsync(c => c.ClassCode == "CLS-07");

                // ===== PREVENT DUPLICATE GROUP =====
                var invExists = await _context.AccountGroups
                    .AnyAsync(g =>
                        g.GroupCode == $"INV-{suffix}" &&
                        g.AccountClassId == inventoryClass.Id);

                var cogsExists = await _context.AccountGroups
                    .AnyAsync(g =>
                        g.GroupCode == $"COGS-{suffix}" &&
                        g.AccountClassId == cogsClass.Id);

                if (!invExists)
                {
                    _context.AccountGroups.Add(new AccountGroup
                    {
                        GroupCode = $"INV-{suffix}",
                        GroupName = request.CategoryName.Trim(),
                        AccountClassId = inventoryClass.Id,
                        Status = finalStatus,   // ⭐ FIXED
                        CreatedBy = username,
                        CreatedDate = DateTime.UtcNow
                    });
                }

                if (!cogsExists)
                {
                    _context.AccountGroups.Add(new AccountGroup
                    {
                        GroupCode = $"COGS-{suffix}",
                        GroupName = request.CategoryName.Trim(),
                        AccountClassId = cogsClass.Id,
                        Status = finalStatus,   // ⭐ FIXED
                        CreatedBy = username,
                        CreatedDate = DateTime.UtcNow
                    });
                }

                // ===== CREATE CATEGORY =====
                var category = new Category
                {
                    CategoryCode = code,
                    CategoryName = request.CategoryName.Trim(),
                    ProductTypeId = request.ProductTypeId,
                    Status = finalStatus,
                    Remarks = request.Remarks,
                    CreatedBy = username,
                    CreatedDate = DateTime.UtcNow
                };

                _context.Categories.Add(category);

                await _context.SaveChangesAsync();
                await trx.CommitAsync();

                return Ok(category);
            }
            catch (Exception ex)
            {
                await trx.RollbackAsync();
                return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
            }
        }

        // =====================================================
        // UPDATE CATEGORY (ERP SAFE + FULL ACCOUNT SYNC)
        // =====================================================
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, CreateCategoryRequest request)
        {
            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (category == null)
                    return NotFound("Category not found.");

                if (category.ProductTypeId != request.ProductTypeId)
                    return BadRequest("Product Type cannot be changed.");

                var username = string.IsNullOrWhiteSpace(CurrentUsername)
                    ? "SYSTEM"
                    : CurrentUsername;

                var oldName = category.CategoryName;
                var oldStatus = category.Status;

                category.CategoryName = request.CategoryName.Trim();
                category.Status = request.Status ?? "Active";
                category.Remarks = request.Remarks;
                category.UpdatedBy = username;
                category.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var suffix = category.CategoryCode.Substring(
                    category.CategoryCode.IndexOf('-') + 1);

                var invGroup = await _context.AccountGroups
                    .FirstOrDefaultAsync(g => g.GroupCode == $"INV-{suffix}");

                var cogsGroup = await _context.AccountGroups
                    .FirstOrDefaultAsync(g => g.GroupCode == $"COGS-{suffix}");

                // ===== NAME SYNC =====
                if (!string.Equals(oldName, category.CategoryName,
                        StringComparison.OrdinalIgnoreCase))
                {
                    if (invGroup != null)
                    {
                        invGroup.GroupName = category.CategoryName;
                        invGroup.UpdatedBy = username;
                        invGroup.UpdatedDate = DateTime.UtcNow;
                    }

                    if (cogsGroup != null)
                    {
                        cogsGroup.GroupName = category.CategoryName;
                        cogsGroup.UpdatedBy = username;
                        cogsGroup.UpdatedDate = DateTime.UtcNow;
                    }
                }

                // ===== STATUS SYNC ⭐ VERY IMPORTANT =====
                if (!string.Equals(oldStatus, category.Status,
                        StringComparison.OrdinalIgnoreCase))
                {
                    if (invGroup != null)
                    {
                        invGroup.Status = category.Status;
                        invGroup.UpdatedBy = username;
                        invGroup.UpdatedDate = DateTime.UtcNow;
                    }

                    if (cogsGroup != null)
                    {
                        cogsGroup.Status = category.Status;
                        cogsGroup.UpdatedBy = username;
                        cogsGroup.UpdatedDate = DateTime.UtcNow;
                    }

                    // ===== CASCADE TO SUBGROUPS =====
                    var invSubGroups = await _context.AccountSubGroups
                        .Where(s => s.SubGroupCode.StartsWith($"INV-{suffix}"))
                        .ToListAsync();

                    var cogsSubGroups = await _context.AccountSubGroups
                        .Where(s => s.SubGroupCode.StartsWith($"COGS-{suffix}"))
                        .ToListAsync();

                    foreach (var sg in invSubGroups)
                    {
                        sg.Status = category.Status;
                        sg.UpdatedBy = username;
                        sg.UpdatedDate = DateTime.UtcNow;
                    }

                    foreach (var sg in cogsSubGroups)
                    {
                        sg.Status = category.Status;
                        sg.UpdatedBy = username;
                        sg.UpdatedDate = DateTime.UtcNow;
                    }

                    // ===== CASCADE TO LEDGERS =====
                    var invLedgers = await _context.GeneralLedgers
                        .Where(l => l.LedgerCode.StartsWith($"INV-{suffix}"))
                        .ToListAsync();

                    var cogsLedgers = await _context.GeneralLedgers
                        .Where(l => l.LedgerCode.StartsWith($"COGS-{suffix}"))
                        .ToListAsync();

                    foreach (var l in invLedgers)
                    {
                        l.Status = category.Status;
                        l.UpdatedBy = username;
                        l.UpdatedDate = DateTime.UtcNow;
                    }

                    foreach (var l in cogsLedgers)
                    {
                        l.Status = category.Status;
                        l.UpdatedBy = username;
                        l.UpdatedDate = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();
                await trx.CommitAsync();

                return Ok(new { message = "Category updated successfully." });
            }
            catch (Exception ex)
            {
                await trx.RollbackAsync();
                return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
            }
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
        // CODE GENERATOR
        // =====================================================
        private async Task<string> GenerateCategoryCode(int productTypeId)
        {
            var productType = await _context.ProductTypes
                .FirstAsync(p => p.Id == productTypeId);

            var match = Regex.Match(productType.TypeCode, @"\d+");
            var typeNumber = match.Value.PadLeft(3, '0');

            var max = await _context.Categories
                .Where(c => c.ProductTypeId == productTypeId)
                .Select(c => c.CategoryCode)
                .ToListAsync();

            int next = 1;

            if (max.Any())
            {
                next = max
                    .Select(c => int.Parse(c.Split('-').Last()))
                    .Max() + 1;
            }

            return $"MC-{typeNumber}-{next:000}";
        }
    }
}