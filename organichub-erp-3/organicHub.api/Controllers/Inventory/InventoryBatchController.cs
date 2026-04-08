using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.Models.Inventory;

namespace OrganicHub.Api.Controllers.Inventory
{
    [ApiController]
    [Route("api/inventory-batch")]
    public class InventoryBatchController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InventoryBatchController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // ⭐ LIST (PER PRODUCT + BATCH)
        // =====================================================
        [HttpGet]
        public async Task<IActionResult> GetBatches()
        {
            var data = await _context.InventoryBatchTransactions
                .AsNoTracking()
                .Include(t => t.Batch)
                    .ThenInclude(b => b.Warehouse)
                .Include(t => t.Product)

                // ✅ SAFE FILTER
                .Where(t =>
                    t.BatchId != null &&
                    t.ProductId != null &&
                    t.Batch != null &&
                    !t.Batch.IsDeleted
                )

                // ✅ GROUP
                .GroupBy(t => new
                {
                    t.BatchId,
                    t.ProductId,
                    BatchNo = t.Batch.BatchNo,
                    BatchDate = t.Batch.BatchDate,
                    SourceNo = t.Batch.SourceNo,
                    WarehouseName = t.Batch.Warehouse != null
                        ? t.Batch.Warehouse.WarehouseName
                        : "",
                    ProductName = t.Product != null
                        ? t.Product.ProductName
                        : "Unknown Product"
                })

                // ✅ SELECT
                .Select(g => new
                {
                    batchId = g.Key.BatchId,
                    productId = g.Key.ProductId,

                    batchNo = g.Key.BatchNo,
                    batchDate = g.Key.BatchDate,

                    productName = g.Key.ProductName,
                    sourceNo = g.Key.SourceNo,
                    warehouseName = g.Key.WarehouseName,

                    unitCost = g.Max(x => x.UnitCost),

                    qtyIn = g.Sum(x => x.QtyIn),
                    qtyOut = g.Sum(x => x.QtyOut),

                    qtyBalance = g
                        .OrderByDescending(x => x.Id)
                        .Select(x => x.RunningBalance)
                        .FirstOrDefault()
                })

                .OrderByDescending(x => x.batchDate)
                .ThenByDescending(x => x.batchId)

                .ToListAsync();

            return Ok(data);
        }

        // =====================================================
        // ⭐ PRODUCT LEDGER
        // =====================================================
        [HttpGet("product-ledger")]
        public async Task<IActionResult> GetProductLedger(
            long productId,
            DateTime fromDate,
            DateTime toDate)
        {
            if (productId <= 0)
                return BadRequest("Invalid product id.");

            var exists = await _context.Products
                .AnyAsync(x => x.Id == productId && !x.IsDeleted);

            if (!exists)
                return NotFound("Product not found.");

            // ✅ ALL DATA
            var all = await _context.InventoryBatchTransactions
                .AsNoTracking()
                .Where(x =>
                    x.ProductId == productId &&
                    x.TransactionDate != null
                )
                .OrderBy(x => x.TransactionDate)
                .ThenBy(x => x.Id)
                .ToListAsync();

            // ✅ OPENING
            var openingBalance = all
                .Where(x => x.TransactionDate < fromDate)
                .Sum(x => x.QtyIn - x.QtyOut);

            // ✅ FILTER
            var filtered = all
                .Where(x =>
                    x.TransactionDate >= fromDate &&
                    x.TransactionDate <= toDate
                )
                .ToList();

            decimal running = openingBalance;

            var result = new List<object>();

            foreach (var x in filtered)
            {
                running += x.QtyIn - x.QtyOut;

                result.Add(new
                {
                    date = x.TransactionDate,
                    particulars = x.TransactionType ?? "",
                    reference = x.SourceNo ?? "",
                    unitRate = x.UnitCost,
                    receipt = x.QtyIn,
                    issue = x.QtyOut,
                    balance = running,
                    remarks = ""
                });
            }

            return Ok(new
            {
                openingBalance,
                data = result
            });
        }

        // =====================================================
        // ⭐ BATCH MOVEMENT
        // =====================================================
        [HttpGet("movement")]
        public async Task<IActionResult> GetBatchMovement(long batchId, long productId)
        {
            if (batchId <= 0 || productId <= 0)
                return BadRequest("Invalid batch/product.");

            var transactions = await _context.InventoryBatchTransactions
                .AsNoTracking()
                .Include(x => x.Batch)
                    .ThenInclude(b => b.Warehouse)
                .Include(x => x.Product)
                .Where(x =>
                    x.BatchId == batchId &&
                    x.ProductId == productId &&
                    x.Batch != null &&
                    !x.Batch.IsDeleted
                )
                .OrderBy(x => x.TransactionDate)
                .ThenBy(x => x.Id)
                .ToListAsync();

            if (!transactions.Any())
                return NotFound("No movement found.");

            var first = transactions.First();
            var last = transactions.Last();

            var master = new
            {
                batchNo = first.Batch?.BatchNo ?? "",
                batchDate = first.Batch?.BatchDate,

                warehouse = first.Batch?.Warehouse?.WarehouseName ?? "",
                source = first.Batch?.SourceNo ?? "",

                product = first.Product?.ProductName ?? "Unknown",

                unitCost = first.UnitCost,
                qtyIn = transactions.Sum(x => x.QtyIn),
                qtyOut = transactions.Sum(x => x.QtyOut),
                balance = last.RunningBalance
            };

            var ledger = transactions.Select(x => new
            {
                date = x.TransactionDate,
                source = x.TransactionType ?? "",
                reference = x.SourceNo ?? "",
                qtyIn = x.QtyIn,
                qtyOut = x.QtyOut,
                balance = x.RunningBalance
            });

            return Ok(new
            {
                master,
                ledger
            });
        }
    }
}