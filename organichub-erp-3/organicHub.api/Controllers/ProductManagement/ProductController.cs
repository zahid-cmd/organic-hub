using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.ProductManagement;
using OrganicHub.Api.DTOs.ProductManagement;
using OrganicHub.Api.Controllers.Base;
using OrganicHub.Api.Models.AccountSetup;

namespace OrganicHub.Api.Controllers.ProductManagement
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ErpControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductResponse>>> GetAll()
        {
            var products = await _context.Products
                .AsNoTracking()
                .Include(p => p.ProductType)
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Unit)
                .Include(p => p.ProductImages)
                .Where(p => !p.IsDeleted)
                .OrderBy(p => p.ProductName)
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
                    PrimaryImageUrl = p.ProductImages
                        .Where(i => !i.IsDeleted && i.IsPrimary)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(products);
        }

        // =====================================================
        // GET BY ID ⭐ REQUIRED FOR EDIT FORM
        // =====================================================
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var product = await _context.Products
                .AsNoTracking()
                .Include(p => p.ProductType)
                .Include(p => p.Category)
                .Include(p => p.SubCategory)
                .Include(p => p.Unit)
                .Include(p => p.ProductImages)
                .Where(p => p.Id == id && !p.IsDeleted)
                .Select(p => new
                {
                    p.Id,
                    p.ProductCode,
                    p.ProductName,
                    p.SKU,
                    p.Barcode,
                    p.ProductTypeId,
                    productTypeName = p.ProductType!.TypeName,
                    p.CategoryId,
                    categoryName = p.Category!.CategoryName,
                    p.SubCategoryId,
                    subCategoryName = p.SubCategory!.SubCategoryName,
                    p.UnitId,
                    unitName = p.Unit!.UnitName,
                    p.Status,
                    p.Remarks,
                    p.CreatedBy,
                    p.CreatedDate,
                    p.UpdatedBy,
                    p.UpdatedDate,
                    primaryImageUrl = p.ProductImages
                        .Where(i => !i.IsDeleted && i.IsPrimary)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound("Product not found.");

            return Ok(product);
        }

        // =====================================================
        // GET NEXT PRODUCT CODE ⭐ REQUIRED FOR PRODUCT FORM
        // =====================================================
        [HttpGet("next-code/{subCategoryId:int}")]
        public async Task<IActionResult> GetNextProductCode(int subCategoryId)
        {
            try
            {
                if (subCategoryId <= 0)
                    return BadRequest("Invalid Sub Category.");

                var code = await GenerateProductCode(subCategoryId);

                return Ok(code);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // =====================================================
        // CREATE ⭐ FINAL ERP SAFE AUTO LEDGER WITH MAPPING
        // =====================================================
        [HttpPost]
        public async Task<IActionResult> Create(ProductRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                var productCode = await GenerateProductCode(request.SubCategoryId);

                var username = string.IsNullOrWhiteSpace(CurrentUsername)
                    ? "SYSTEM"
                    : CurrentUsername;

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
                    CreatedBy = username,
                    CreatedDate = DateTime.UtcNow,
                    IsDeleted = false
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                // ================= GET SUBCATEGORY SUFFIX =================

                var subCategory = await _context.SubCategories
                    .FirstAsync(s => s.Id == product.SubCategoryId);

                var scParts = subCategory.SubCategoryCode.Split('-');

                if (scParts.Length < 4)
                    throw new Exception("Invalid SubCategory Code.");

                var suffix = $"{scParts[1]}-{scParts[2]}-{scParts[3]}";

                // ================= INVENTORY LEDGER =================

                var invSubGroup = await _context.AccountSubGroups
                    .FirstOrDefaultAsync(sg =>
                        !sg.IsDeleted &&
                        sg.Status == "Active" &&
                        sg.SubGroupCode == $"INV-{suffix}");

                if (invSubGroup == null)
                    throw new Exception($"Inventory SubGroup not found for {suffix}");

                var invPrefix = $"INV-{suffix}";

                var lastInvLedger = await _context.GeneralLedgers
                    .Where(l => l.LedgerCode.StartsWith(invPrefix))
                    .OrderByDescending(l => l.Id)
                    .FirstOrDefaultAsync();

                int invNext = 1;

                if (lastInvLedger != null)
                {
                    var parts = lastInvLedger.LedgerCode.Split('-');
                    if (int.TryParse(parts.Last(), out int seq))
                        invNext = seq + 1;
                }

                var invLedger = new GeneralLedger
                {
                    LedgerCode = $"{invPrefix}-{invNext:0000}",
                    LedgerName = $"Inventory - {product.ProductName}",
                    SubGroupId = invSubGroup.Id,
                    Status = "Active",
                    CreatedBy = username,
                    CreatedDate = DateTime.UtcNow,
                    IsDeleted = false
                };

                _context.GeneralLedgers.Add(invLedger);
                await _context.SaveChangesAsync(); // ⭐ Needed to get ID

                // ================= COGS LEDGER =================

                var cogsSubGroup = await _context.AccountSubGroups
                    .FirstOrDefaultAsync(sg =>
                        !sg.IsDeleted &&
                        sg.Status == "Active" &&
                        sg.SubGroupCode == $"COGS-{suffix}");

                if (cogsSubGroup == null)
                    throw new Exception($"COGS SubGroup not found for {suffix}");

                var cogsPrefix = $"COGS-{suffix}";

                var lastCogsLedger = await _context.GeneralLedgers
                    .Where(l => l.LedgerCode.StartsWith(cogsPrefix))
                    .OrderByDescending(l => l.Id)
                    .FirstOrDefaultAsync();

                int cogsNext = 1;

                if (lastCogsLedger != null)
                {
                    var parts = lastCogsLedger.LedgerCode.Split('-');
                    if (int.TryParse(parts.Last(), out int seq))
                        cogsNext = seq + 1;
                }

                var cogsLedger = new GeneralLedger
                {
                    LedgerCode = $"{cogsPrefix}-{cogsNext:0000}",
                    LedgerName = $"COGS - {product.ProductName}",
                    SubGroupId = cogsSubGroup.Id,
                    Status = "Active",
                    CreatedBy = username,
                    CreatedDate = DateTime.UtcNow,
                    IsDeleted = false
                };

                _context.GeneralLedgers.Add(cogsLedger);
                await _context.SaveChangesAsync(); // ⭐ Needed to get ID

                // ================= ⭐ STORE LEDGER IDS IN PRODUCT =================

                product.InventoryLedgerId = invLedger.Id;
                product.CogsLedgerId = cogsLedger.Id;

                await _context.SaveChangesAsync();

                await trx.CommitAsync();

                return Ok(product);
            }
            catch (Exception ex)
            {
                await trx.RollbackAsync();
                return StatusCode(500, ex.InnerException?.Message ?? ex.Message);
            }
        }
        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, ProductRequest request)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

            if (product == null)
                return NotFound("Product not found.");

            if (product.ProductTypeId != request.ProductTypeId ||
                product.CategoryId != request.CategoryId ||
                product.SubCategoryId != request.SubCategoryId)
            {
                return BadRequest("Classification cannot be changed.");
            }

            product.ProductName = request.ProductName.Trim();
            product.SKU = request.SKU;
            product.Barcode = request.Barcode;
            product.UnitId = request.UnitId;
            product.Status = request.Status ?? "Active";
            product.Remarks = request.Remarks;
            product.UpdatedBy = CurrentUsername;
            product.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Product updated successfully." });
        }
        // =====================================================
        // GET PRODUCTS BY SUBCATEGORY ⭐ REQUIRED FOR INVENTORY TREE
        // =====================================================
        [HttpGet("by-subcategory/{subCategoryId:int}")]
        public async Task<IActionResult> GetBySubCategory(int subCategoryId)
        {
            var list = await _context.Products
                .AsNoTracking()
                .Include(p => p.Unit)
                .Where(p =>
                    !p.IsDeleted &&
                    p.Status == "Active" &&
                    p.SubCategoryId == subCategoryId)
                .OrderBy(p => p.ProductName)
                .Select(p => new
                {
                    id = p.Id,
                    productCode = p.ProductCode,
                    productName = p.ProductName,
                    unitName = p.Unit != null ? p.Unit.UnitName : null,
                    status = p.Status     // ⭐ VERY IMPORTANT
                })
                .ToListAsync();

            return Ok(list);
        }
        // =====================================================
        // DELETE
        // =====================================================
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

            if (product == null)
                return NotFound();

            product.IsDeleted = true;
            product.UpdatedBy = CurrentUsername;
            product.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok();
        }

        // =====================================================
        // STABLE PRODUCT CODE GENERATOR ⭐ FINAL ERP SAFE
        // =====================================================
        private async Task<string> GenerateProductCode(int subCategoryId)
        {
            var subCategory = await _context.SubCategories
                .Include(s => s.Category)
                .ThenInclude(c => c.ProductType)
                .FirstOrDefaultAsync(s => s.Id == subCategoryId);

            if (subCategory == null ||
                subCategory.Category == null ||
                subCategory.Category.ProductType == null)
                throw new Exception("Invalid classification structure.");

            // ⭐ Extract numeric prefix from SubCategoryCode
            var parts = subCategory.SubCategoryCode.Split('-');

            if (parts.Length < 4)
                throw new Exception("Invalid SubCategory Code format.");

            var numericPrefix = $"{parts[1]}-{parts[2]}-{parts[3]}";

            // ⭐ FINAL PRODUCT PREFIX
            var fullPrefix = $"P-{numericPrefix}";

            // Load existing product codes
            var existingCodes = await _context.Products
                .Where(p => p.SubCategoryId == subCategoryId)
                .Select(p => p.ProductCode)
                .ToListAsync();

            int maxSequence = 0;

            foreach (var code in existingCodes)
            {
                if (string.IsNullOrWhiteSpace(code))
                    continue;

                var cleanCode = code.StartsWith("P-")
                    ? code.Substring(2)
                    : code;

                var codeParts = cleanCode.Split('-');

                if (codeParts.Length < 4)
                    continue;

                var existingPrefix =
                    $"{codeParts[0]}-{codeParts[1]}-{codeParts[2]}";

                if (existingPrefix != numericPrefix)
                    continue;

                if (int.TryParse(codeParts.Last(), out int seq))
                {
                    if (seq > maxSequence)
                        maxSequence = seq;
                }
            }

            return $"{fullPrefix}-{(maxSequence + 1):D4}";
        }

        // =====================================================
        // REPAIR ⭐ GENERATE MISSING PRODUCT LEDGERS
        // =====================================================
        [HttpPost("repair-ledgers")]
        public async Task<IActionResult> RepairLedgers()
        {
            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                var products = await _context.Products
                    .Where(p => !p.IsDeleted &&
                            (p.InventoryLedgerId == null || p.CogsLedgerId == null))
                    .ToListAsync();

                int repaired = 0;

                foreach (var product in products)
                {
                    var subCategory = await _context.SubCategories
                        .FirstAsync(s => s.Id == product.SubCategoryId);

                    var scParts = subCategory.SubCategoryCode.Split('-');

                    if (scParts.Length < 4)
                        continue;

                    var suffix = $"{scParts[1]}-{scParts[2]}-{scParts[3]}";

                    // ================= INVENTORY =================

                    if (product.InventoryLedgerId == null)
                    {
                        var invSubGroup = await _context.AccountSubGroups
                            .FirstOrDefaultAsync(sg =>
                                !sg.IsDeleted &&
                                sg.Status == "Active" &&
                                sg.SubGroupCode == $"INV-{suffix}");

                        if (invSubGroup != null)
                        {
                            var invPrefix = $"INV-{suffix}";

                            var last = await _context.GeneralLedgers
                                .Where(l => l.LedgerCode.StartsWith(invPrefix))
                                .OrderByDescending(l => l.Id)
                                .FirstOrDefaultAsync();

                            int next = 1;

                            if (last != null)
                            {
                                var parts = last.LedgerCode.Split('-');
                                if (int.TryParse(parts.Last(), out int seq))
                                    next = seq + 1;
                            }

                            var ledger = new GeneralLedger
                            {
                                LedgerCode = $"{invPrefix}-{next:0000}",
                                LedgerName = $"Inventory - {product.ProductName}",
                                SubGroupId = invSubGroup.Id,
                                Status = "Active",
                                CreatedBy = "SYSTEM",
                                CreatedDate = DateTime.UtcNow
                            };

                            _context.GeneralLedgers.Add(ledger);
                            await _context.SaveChangesAsync();

                            product.InventoryLedgerId = ledger.Id;
                            repaired++;
                        }
                    }

                    // ================= COGS =================

                    if (product.CogsLedgerId == null)
                    {
                        var cogsSubGroup = await _context.AccountSubGroups
                            .FirstOrDefaultAsync(sg =>
                                !sg.IsDeleted &&
                                sg.Status == "Active" &&
                                sg.SubGroupCode == $"COGS-{suffix}");

                        if (cogsSubGroup != null)
                        {
                            var prefix = $"COGS-{suffix}";

                            var last = await _context.GeneralLedgers
                                .Where(l => l.LedgerCode.StartsWith(prefix))
                                .OrderByDescending(l => l.Id)
                                .FirstOrDefaultAsync();

                            int next = 1;

                            if (last != null)
                            {
                                var parts = last.LedgerCode.Split('-');
                                if (int.TryParse(parts.Last(), out int seq))
                                    next = seq + 1;
                            }

                            var ledger = new GeneralLedger
                            {
                                LedgerCode = $"{prefix}-{next:0000}",
                                LedgerName = $"COGS - {product.ProductName}",
                                SubGroupId = cogsSubGroup.Id,
                                Status = "Active",
                                CreatedBy = "SYSTEM",
                                CreatedDate = DateTime.UtcNow
                            };

                            _context.GeneralLedgers.Add(ledger);
                            await _context.SaveChangesAsync();

                            product.CogsLedgerId = ledger.Id;
                            repaired++;
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await trx.CommitAsync();

                return Ok(new
                {
                    message = "Ledger repair completed",
                    repairedProducts = repaired
                });
            }
            catch (Exception ex)
            {
                await trx.RollbackAsync();
                return StatusCode(500, ex.Message);
            }
        }

        // =====================================================
        // GET PURCHASABLE PRODUCTS ⭐ PURCHASE ORDER FINAL
        // =====================================================
        [HttpGet("purchasable")]
        public async Task<IActionResult> GetPurchasableProducts()
        {
            var list = await _context.Products
                .AsNoTracking()
                .Include(p => p.ProductType)
                .Include(p => p.SubCategory)
                .Include(p => p.Unit)
                .Where(p =>
                    !p.IsDeleted &&
                    p.Status == "Active" &&
                    p.ProductType.IsPurchasable == true &&
                    p.SubCategory.Status == "Active"
                )
                .OrderBy(p => p.ProductName)
                .Select(p => new
                {
                    id = p.Id,
                    productName = p.ProductName,
                    productTypeId = p.ProductTypeId,     // ⭐ VERY IMPORTANT
                    subCategoryId = p.SubCategoryId,     // ⭐ VERY IMPORTANT
                    stock = 0,                           // ⭐ placeholder (future stock engine)
                    unitName = p.Unit != null ? p.Unit.UnitName : null
                })
                .ToListAsync();

            return Ok(list);
        }
    }
}