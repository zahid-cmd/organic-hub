using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.ProductManagement;
using OrganicHub.Api.Models.AccountSetup;
using OrganicHub.Api.DTOs.ProductManagement;
using OrganicHub.Api.Controllers.Base;

namespace OrganicHub.Api.Controllers.ProductManagement
{
    [Route("api/[controller]")]
    public class SubCategoryController : ErpControllerBase
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
                .AsNoTracking()
                .OrderBy(s => s.SubCategoryName)
                .Select(s => new
                {
                    s.Id,
                    s.SubCategoryCode,
                    s.SubCategoryName,
                    s.CategoryId,
                    CategoryName = s.Category.CategoryName,
                    CategoryCode = s.Category.CategoryCode,
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
        // GET BY ID ⭐ REQUIRED FOR EDIT FORM
        // =====================================================
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.SubCategories
                .Include(s => s.Category)
                .Where(s => s.Id == id)
                .Select(s => new
                {
                    s.Id,
                    s.SubCategoryCode,
                    s.SubCategoryName,
                    s.CategoryId,
                    CategoryName = s.Category.CategoryName,
                    CategoryCode = s.Category.CategoryCode,
                    s.Status,
                    s.Remarks,
                    s.CreatedBy,
                    s.CreatedDate,
                    s.UpdatedBy,
                    s.UpdatedDate
                })
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound("SubCategory not found.");

            return Ok(item);
        }
        // =====================================================
        // CREATE (ERP SAFE + STATUS INHERIT + DUP SAFE)
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(CreateSubCategoryRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Id == request.CategoryId);

                if (category == null)
                    return BadRequest("Invalid Category.");

                if (category.Status?.ToUpper() == "INACTIVE")
                    return BadRequest("Cannot create sub category under inactive category.");

                var username = string.IsNullOrWhiteSpace(CurrentUsername)
                    ? "SYSTEM"
                    : CurrentUsername;

                var status = request.Status ?? "Active";

                // ===== ERP SAFE CODE GENERATION =====
                var existingCodes = await _context.SubCategories
                    .Where(s => s.CategoryId == request.CategoryId)
                    .Select(s => s.SubCategoryCode)
                    .ToListAsync();

                int maxSequence = 0;

                foreach (var code in existingCodes)
                {
                    if (string.IsNullOrWhiteSpace(code)) continue;

                    var parts = code.Split('-');

                    if (int.TryParse(parts.Last(), out int seq))
                        if (seq > maxSequence)
                            maxSequence = seq;
                }

                int next = maxSequence + 1;

                var newCode = $"{category.CategoryCode}-{next:000}";

                var suffix = string.Join("-", newCode.Split('-').Skip(1));
                var categorySuffix = string.Join("-", category.CategoryCode.Split('-').Skip(1));

                // ===== LOAD ACCOUNT GROUP =====
                var invClass = await _context.AccountClasses
                    .FirstAsync(c => c.ClassCode == "CLS-06");

                var cogsClass = await _context.AccountClasses
                    .FirstAsync(c => c.ClassCode == "CLS-07");

                var invGroup = await _context.AccountGroups
                    .FirstOrDefaultAsync(g =>
                        g.GroupCode == $"INV-{categorySuffix}" &&
                        g.AccountClassId == invClass.Id);

                var cogsGroup = await _context.AccountGroups
                    .FirstOrDefaultAsync(g =>
                        g.GroupCode == $"COGS-{categorySuffix}" &&
                        g.AccountClassId == cogsClass.Id);

                if (invGroup == null || cogsGroup == null)
                    return BadRequest("Accounting Group missing. Create Category again.");

                // ===== DUPLICATE SAFE ACCOUNT SUBGROUP =====
                var invExists = await _context.AccountSubGroups
                    .AnyAsync(sg => sg.SubGroupCode == $"INV-{suffix}");

                var cogsExists = await _context.AccountSubGroups
                    .AnyAsync(sg => sg.SubGroupCode == $"COGS-{suffix}");

                if (!invExists)
                {
                    _context.AccountSubGroups.Add(new AccountSubGroup
                    {
                        SubGroupCode = $"INV-{suffix}",
                        SubGroupName = request.SubCategoryName.Trim(),
                        GroupId = invGroup.Id,
                        Status = status,
                        CreatedBy = username,
                        CreatedDate = DateTime.UtcNow
                    });
                }

                if (!cogsExists)
                {
                    _context.AccountSubGroups.Add(new AccountSubGroup
                    {
                        SubGroupCode = $"COGS-{suffix}",
                        SubGroupName = request.SubCategoryName.Trim(),
                        GroupId = cogsGroup.Id,
                        Status = status,
                        CreatedBy = username,
                        CreatedDate = DateTime.UtcNow
                    });
                }

                // ===== CREATE PRODUCT SUB CATEGORY =====
                var entity = new SubCategory
                {
                    SubCategoryCode = newCode,
                    SubCategoryName = request.SubCategoryName.Trim(),
                    CategoryId = request.CategoryId,
                    Status = status,
                    Remarks = request.Remarks,
                    CreatedBy = username,
                    CreatedDate = DateTime.UtcNow
                };

                _context.SubCategories.Add(entity);

                await _context.SaveChangesAsync();
                await trx.CommitAsync();

                return Ok(entity);
            }
            catch (Exception ex)
            {
                await trx.RollbackAsync();
                return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
            }
        }
        // =====================================================
        // UPDATE (ERP SAFE + FULL ACCOUNT SYNC)
        // =====================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateSubCategoryRequest request)
        {
            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                var entity = await _context.SubCategories
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (entity == null)
                    return NotFound("Sub Category not found.");

                if (entity.CategoryId != request.CategoryId)
                    return BadRequest("Category cannot be changed.");

                var username = string.IsNullOrWhiteSpace(CurrentUsername)
                    ? "SYSTEM"
                    : CurrentUsername;

                var oldName = entity.SubCategoryName;
                var oldStatus = entity.Status ?? "Active";

                var newStatus = request.Status ?? "Active";

                entity.SubCategoryName = request.SubCategoryName.Trim();
                entity.Status = newStatus;
                entity.Remarks = request.Remarks;
                entity.UpdatedBy = username;
                entity.UpdatedDate = DateTime.UtcNow;

                var suffix = string.Join("-", entity.SubCategoryCode.Split('-').Skip(1));

                var inv = await _context.AccountSubGroups
                    .FirstOrDefaultAsync(sg => sg.SubGroupCode == $"INV-{suffix}");

                var cogs = await _context.AccountSubGroups
                    .FirstOrDefaultAsync(sg => sg.SubGroupCode == $"COGS-{suffix}");

                // ===== NAME SYNC =====
                if (!string.Equals(oldName, entity.SubCategoryName, StringComparison.OrdinalIgnoreCase))
                {
                    if (inv != null)
                    {
                        inv.SubGroupName = entity.SubCategoryName;
                        inv.UpdatedBy = username;
                        inv.UpdatedDate = DateTime.UtcNow;
                    }

                    if (cogs != null)
                    {
                        cogs.SubGroupName = entity.SubCategoryName;
                        cogs.UpdatedBy = username;
                        cogs.UpdatedDate = DateTime.UtcNow;
                    }
                }

                // ===== STATUS SYNC =====
                if (!string.Equals(oldStatus, newStatus, StringComparison.OrdinalIgnoreCase))
                {
                    if (inv != null)
                    {
                        inv.Status = newStatus;
                        inv.UpdatedBy = username;
                        inv.UpdatedDate = DateTime.UtcNow;
                    }

                    if (cogs != null)
                    {
                        cogs.Status = newStatus;
                        cogs.UpdatedBy = username;
                        cogs.UpdatedDate = DateTime.UtcNow;
                    }

                    var invLedgers = await _context.GeneralLedgers
                        .Where(l => l.LedgerCode.StartsWith($"INV-{suffix}"))
                        .ToListAsync();

                    var cogsLedgers = await _context.GeneralLedgers
                        .Where(l => l.LedgerCode.StartsWith($"COGS-{suffix}"))
                        .ToListAsync();

                    foreach (var l in invLedgers)
                    {
                        l.Status = newStatus;
                        l.UpdatedBy = username;
                        l.UpdatedDate = DateTime.UtcNow;
                    }

                    foreach (var l in cogsLedgers)
                    {
                        l.Status = newStatus;
                        l.UpdatedBy = username;
                        l.UpdatedDate = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();
                await trx.CommitAsync();

                return Ok(entity);
            }
            catch (Exception ex)
            {
                await trx.RollbackAsync();
                return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
            }
        }
        // =====================================================
        // GET NEXT SUB CATEGORY CODE ⭐ REQUIRED FOR FORM
        // =====================================================
        [HttpGet("next-code/{categoryId:int}")]
        public async Task<IActionResult> GetNextCode(int categoryId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null)
                return BadRequest("Invalid Category.");

            var existingCodes = await _context.SubCategories
                .Where(s => s.CategoryId == categoryId)
                .Select(s => s.SubCategoryCode)
                .ToListAsync();

            int maxSequence = 0;

            foreach (var code in existingCodes)
            {
                if (string.IsNullOrWhiteSpace(code)) continue;

                var parts = code.Split('-');

                if (int.TryParse(parts.Last(), out int seq))
                    if (seq > maxSequence)
                        maxSequence = seq;
            }

            int next = maxSequence + 1;

            var nextCode = $"{category.CategoryCode}-{next:000}";

            return Ok(nextCode);
        }

        // =====================================================
        // GET SUBCATEGORY BY CATEGORY ⭐ REPORT SAFE (SHOW ALL)
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
                    subCategoryName = s.SubCategoryName,
                    categoryId = s.CategoryId,
                    status = s.Status
                })
                .ToListAsync();

            return Ok(list);
        }

        // =====================================================
        // GET SALEABLE SUBCATEGORIES ⭐ PRICE FORM
        // =====================================================
        [HttpGet("saleable")]
        public async Task<IActionResult> GetSaleableSubCategories()
        {
            var list = await _context.SubCategories
                .Include(s => s.Category)
                .ThenInclude(c => c.ProductType)
                .Where(s =>
                    s.Status == "Active" &&
                    s.Category.Status == "Active" &&
                    s.Category.ProductType.IsSellable == true)
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
        // GET PURCHASABLE SUBCATEGORIES ⭐ PURCHASE ORDER
        // =====================================================
        [HttpGet("purchasable")]
        public async Task<IActionResult> GetPurchasableSubCategories()
        {
            var list = await _context.SubCategories
                .Include(s => s.Category)
                .ThenInclude(c => c.ProductType)
                .Where(s =>
                    s.Status == "Active" &&
                    s.Category.Status == "Active" &&
                    s.Category.ProductType.IsPurchasable == true)
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
        // GET SUBCATEGORY BY PRODUCT TYPE ⭐ PURCHASE ORDER
        // =====================================================
        [HttpGet("by-product-type/{productTypeId:int}")]
        public async Task<IActionResult> GetByProductType(int productTypeId)
        {
            var list = await _context.SubCategories
                .Include(s => s.Category)
                .ThenInclude(c => c.ProductType)
                .Where(s =>
                    s.Status == "Active" &&
                    s.Category.ProductTypeId == productTypeId)
                .OrderBy(s => s.SubCategoryName)
                .Select(s => new
                {
                    id = s.Id,
                    subCategoryName = s.SubCategoryName
                })
                .ToListAsync();

            return Ok(list);
        }


    }
}