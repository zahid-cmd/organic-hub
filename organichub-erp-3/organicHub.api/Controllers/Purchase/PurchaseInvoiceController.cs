using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.DTOs.Purchase;
using OrganicHub.Api.Models.Purchase;
using Microsoft.AspNetCore.Authorization;
using OrganicHub.Api.Models.Inventory;

namespace OrganicHub.Api.Controllers.Purchase
{
    [ApiController]
    [Route("api/PurchaseInvoice")]
    public class PurchaseInvoiceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PurchaseInvoiceController(ApplicationDbContext context)
        {
            _context = context;
        }

        /* =========================================
        ERP GLOBAL ROUNDING ENGINE
        ========================================= */
        private decimal Round2(decimal v)
        {
            return Math.Round(v, 2, MidpointRounding.AwayFromZero);
        }
        // =====================================================
        // GET INVOICE NUMBER
        // =====================================================
        private string GetInvoiceNumericPart(string invoiceNo)
        {
            if (string.IsNullOrWhiteSpace(invoiceNo))
                return "000000000";

            var parts = invoiceNo.Split('-');

            if (parts.Length < 2)
                return invoiceNo;

            return parts[1];   // removes PINV
        }

        // =====================================================
        // GET ALL ⭐ ERP LIST SAFE
        // =====================================================

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseInvoiceListDto>>> GetAll()
        {
            var invoices = await _context.PurchaseInvoices
                .AsNoTracking()
                .Include(o => o.Supplier)
                .Include(o => o.PurchaseOrder)
                .Include(o => o.Warehouse)
                .Where(o => !o.IsDeleted)
                .OrderByDescending(o => o.Id)
                .Select(o => new PurchaseInvoiceListDto
                {
                    Id = o.Id,
                    InvoiceNo = o.InvoiceNo,
                    InvoiceDate = o.InvoiceDate,

                    SupplierName = o.Supplier.SupplierName,

                    PurchaseOrderNo = o.PurchaseOrder != null
                        ? o.PurchaseOrder.OrderNo
                        : null,

                    PurchaseOrderDate = o.PurchaseOrder != null
                        ? o.PurchaseOrder.OrderDate
                        : null,

                    WarehouseName = o.Warehouse.WarehouseName,

                    ProductValue = o.ProductValue,
                    InvoiceValue = o.TotalAmount,

                    Status = o.Status   // ⭐ VERY IMPORTANT
                })
                .ToListAsync();

            return Ok(invoices);
        }


        // =====================================================
        // GET BY ID ⭐ ERP FORM SAFE
        // =====================================================

        [AllowAnonymous]
        [HttpGet("{id:long}")]
        public async Task<ActionResult<PurchaseInvoiceDetailsDto>> GetById(long id)
        {
            var invoice = await _context.PurchaseInvoices
                .AsNoTracking()
                .Include(o => o.Supplier)
                .Include(o => o.Warehouse)
                .Include(o => o.PurchaseOrder)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

            if (invoice == null)
                return NotFound("Purchase invoice not found.");

            var result = new PurchaseInvoiceDetailsDto
            {
                Id = invoice.Id,
                InvoiceNo = invoice.InvoiceNo,
                InvoiceDate = invoice.InvoiceDate,

                SupplierId = invoice.SupplierId,
                PurchaseTypeId = invoice.PurchaseTypeId,

                SupplierName = invoice.Supplier?.SupplierName,
                SupplierPhone = invoice.Supplier?.Phone,
                SupplierAddress = invoice.Supplier?.Address,

                PurchaseOrderId = invoice.PurchaseOrderId,

                WarehouseId = (long)invoice.WarehouseId,

                Reference = invoice.Reference,

                PrimaryTransport = invoice.PrimaryTransport,
                SecondaryTransport = invoice.SecondaryTransport,
                Discount = invoice.Discount,

                ProductValue = invoice.ProductValue,
                TotalAmount = invoice.TotalAmount,

                Status = invoice.Status,   // ⭐ VERY IMPORTANT

                Notes = invoice.Notes,

                Items = invoice.Items.Select(i => new PurchaseInvoiceItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product.ProductName,

                    CommercialQty = i.CommercialQty,
                    NormalLossPercent = i.NormalLossPercent,
                    Quantity = i.Quantity,

                    CommercialRate = i.CommercialRate,
                    Rate = i.Rate,
                    Amount = i.Amount
                }).ToList()
            };

            return Ok(result);
        }

        // =====================================================
        // CREATE
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> Create(PurchaseInvoiceCreateDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid request.");

            if (dto.Items == null || !dto.Items.Any())
                return BadRequest("At least one item is required.");

            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                var now = DateTime.UtcNow;
                var prefix = $"PINV-{now:MM}{now:yyyy}";

                var lastInvoice = await _context.PurchaseInvoices
                    .Where(p => p.InvoiceNo.StartsWith(prefix))
                    .OrderByDescending(p => p.Id)
                    .Select(p => p.InvoiceNo)
                    .FirstOrDefaultAsync();

                int nextSerial = 1;

                if (!string.IsNullOrEmpty(lastInvoice))
                {
                    var serial = lastInvoice.Substring(prefix.Length);
                    if (int.TryParse(serial, out int last))
                        nextSerial = last + 1;
                }

                var invoiceNo = $"{prefix}{nextSerial:D3}";

                decimal primary = Round2(dto.PrimaryTransport ?? 0);
                decimal secondary = Round2(dto.SecondaryTransport ?? 0);
                decimal discount = Round2(dto.Discount ?? 0);

                var invoice = new PurchaseInvoice
                {
                    InvoiceNo = invoiceNo,
                    InvoiceDate = DateTime.SpecifyKind(dto.InvoiceDate, DateTimeKind.Utc),

                    SupplierId = dto.SupplierId,
                    PurchaseOrderId = dto.PurchaseOrderId,
                    PurchaseTypeId = dto.PurchaseTypeId,

                    WarehouseId = (int)dto.WarehouseId,
                    Reference = dto.Reference,

                    PrimaryTransport = primary,
                    SecondaryTransport = secondary,
                    Discount = discount,

                    Notes = dto.Notes,
                    Status = dto.Status ?? "Draft",
                    CreatedAt = DateTime.UtcNow
                };

                _context.PurchaseInvoices.Add(invoice);
                await _context.SaveChangesAsync();

                decimal total = 0;

                foreach (var item in dto.Items)
                {
                    decimal netQty = Round2(item.Quantity);
                    decimal effRate = Round2(item.Rate);
                    decimal amount = Round2(item.Amount);

                    _context.PurchaseInvoiceItems.Add(new PurchaseInvoiceItem
                    {
                        PurchaseInvoiceId = invoice.Id,
                        ProductId = item.ProductId,

                        CommercialQty = Round2(item.CommercialQty),
                        NormalLossPercent = Round2(item.NormalLossPercent),
                        Quantity = netQty,

                        CommercialRate = Round2(item.CommercialRate),
                        Rate = effRate,
                        Amount = amount
                    });

                    total += amount;
                }

                total = Round2(total);

                invoice.ProductValue = total;
                invoice.TotalAmount = Round2(total + primary + secondary - discount);

                await _context.SaveChangesAsync();


                // ⭐⭐⭐ ERP ENGINE START (SIMPLIFIED — ONE PI = ONE BATCH)
                if (invoice.Status == "Posted")
                {
                    var numericPart = GetInvoiceNumericPart(invoice.InvoiceNo);
                    string batchNo = "Batch-" + numericPart;

                    // ⭐ aggregate qty + weighted cost
                    decimal totalQty = 0;
                    decimal totalValue = 0;

                    foreach (var item in dto.Items)
                    {
                        decimal netQty = Round2(item.Quantity);
                        decimal rate = Round2(item.Rate);

                        totalQty += netQty;
                        totalValue += netQty * rate;
                    }

                    if (totalQty <= 0)
                        throw new Exception("Batch quantity cannot be zero.");

                    decimal weightedCost = Round2(totalValue / totalQty);

                    var firstItem = dto.Items.FirstOrDefault();

                    if (firstItem == null)
                        throw new Exception("No items found in Purchase Invoice");

                    // ✅ SAFE FALLBACK (NO FK CRASH)
                    var baseProductId = firstItem.ProductId > 0
                        ? firstItem.ProductId
                        : dto.Items.First(i => i.ProductId > 0).ProductId;

                    var batch = new InventoryBatch
                    {
                        BatchNo = batchNo,

                        // ✅ SAFE + VALID FK
                        ProductId = baseProductId,

                        WarehouseId = invoice.WarehouseId,

                        SourceType = InventorySourceType.PurchaseInvoice,
                        SourceId = invoice.Id,
                        SourceNo = invoice.InvoiceNo,

                        QtyIn = 0,
                        QtyOut = 0,
                        QtyBalance = 0,

                        UnitCost = weightedCost,

                        BatchDate = invoice.InvoiceDate,
                        BatchStatus = InventoryBatchStatus.Available,

                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "SYSTEM",
                        IsDeleted = false
                    };

                    _context.InventoryBatches.Add(batch);
                    await _context.SaveChangesAsync();   // ⭐ generate BatchId

                    foreach (var item in dto.Items)
                    {

                        var productId = item.ProductId > 0 
                            ? item.ProductId 
                            : dto.Items.First().ProductId;oiceDate,
                            "PURCHASE",
                            invoice.InvoiceNo,
                            invoice.Id,
                            productId   // ✅ FIXED
                        );
                    }   }
                // ⭐⭐⭐ ERP ENGINE END  return Ok(new
                {
                    invoiceId = invoice.Id,
                    invoiceNo = invoice.InvoiceNo
                });
            }
            catch (Exception ex)
            {
                await trx.RollbackAsync();
                return StatusCode(500, ex.Message);
            }
        }


        // =====================================================
        // LAST PURCHASE RATE ⭐ VERY IMPORTANT
        // =====================================================

        [HttpGet("last-rate/{productId:long}")]
        public async Task<ActionResult<decimal>> GetLastPurchaseRate(long productId)
        {
            var rate = await _context.PurchaseInvoiceItems
                .Where(i => i.ProductId == productId &&
                            !i.PurchaseInvoice.IsDeleted)
                .OrderByDescending(i => i.PurchaseInvoice.InvoiceDate)
                .Select(i => (decimal?)i.Rate)
                .FirstOrDefaultAsync();

            return Ok(rate ?? 0);
        }

        // =====================================================
        // UPDATE ⭐ ERP SAFE POST ENGINE (FINAL CLEAN)
        // =====================================================
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, PurchaseInvoiceCreateDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid request.");

            var invoice = await _context.PurchaseInvoices
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

            if (invoice == null)
                return NotFound("Purchase invoice not found.");

            if (invoice.Status == "Posted")
                return BadRequest("Posted invoice cannot be edited.");

            using var trx = await _context.Database.BeginTransactionAsync();

            try
            {
                // =====================================================
                // 🔥 STEP 1: DELETE OLD BATCH + TRANSACTIONS
                // =====================================================
                var oldBatches = await _context.InventoryBatches
                    .Where(b => b.SourceType == InventorySourceType.PurchaseInvoice &&
                                b.SourceId == invoice.Id)
                    .ToListAsync();

                foreach (var b in oldBatches)
                {
                    var oldTrx = await _context.InventoryBatchTransactions
                        .Where(t => t.BatchId == b.BatchId)
                        .ToListAsync();

                    _context.InventoryBatchTransactions.RemoveRange(oldTrx);
                }

                _context.InventoryBatches.RemoveRange(oldBatches);
                _context.PurchaseInvoiceItems.RemoveRange(invoice.Items);

                await _context.SaveChangesAsync();


                // =====================================================
                // 🔥 STEP 2: UPDATE HEADER
                // =====================================================
                invoice.SupplierId = dto.SupplierId;
                invoice.InvoiceDate = DateTime.SpecifyKind(dto.InvoiceDate, DateTimeKind.Utc);
                invoice.PurchaseOrderId = dto.PurchaseOrderId;
                invoice.PurchaseTypeId = dto.PurchaseTypeId;
                invoice.WarehouseId = dto.WarehouseId;
                invoice.Reference = dto.Reference;
                invoice.Status = dto.Status ?? "Draft";
                invoice.Notes = dto.Notes;

                decimal total = 0;


                // =====================================================
                // 🔥 STEP 3: INSERT ITEMS
                // =====================================================
                foreach (var item in dto.Items)
                {
                    decimal netQty = Round2(item.Quantity);
                    decimal rate = Round2(item.Rate);
                    decimal amount = Round2(item.Amount);

                    _context.PurchaseInvoiceItems.Add(new PurchaseInvoiceItem
                    {
                        PurchaseInvoiceId = invoice.Id,
                        ProductId = item.ProductId,

                        CommercialQty = Round2(item.CommercialQty),
                        NormalLossPercent = Round2(item.NormalLossPercent),
                        Quantity = netQty,

                        CommercialRate = Round2(item.CommercialRate),
                        Rate = rate,
                        Amount = amount
                    });

                    total += amount;
                }

                invoice.ProductValue = Round2(total);

                await _context.SaveChangesAsync();


                // =====================================================
                // 🔥 STEP 4: CREATE BATCH + PER PRODUCT TRANSACTIONS
                // =====================================================
                if (invoice.Status == "Posted")
                {
                    var numericPart = GetInvoiceNumericPart(invoice.InvoiceNo);
                    string batchNo = "Batch-" + numericPart;

                    var batch = new InventoryBatch
                    {
                        BatchNo = batchNo,
                        ProductId = null, // DOCUMENT LEVEL

                        WarehouseId = invoice.WarehouseId,

                        SourceType = InventorySourceType.PurchaseInvoice,
                        SourceId = invoice.Id,
                        SourceNo = invoice.InvoiceNo,

                        QtyIn = 0,
                        QtyOut = 0,
                        QtyBalance = 0,

                        UnitCost = 0,

                        BatchDate = invoice.InvoiceDate,
                        BatchStatus = InventoryBatchStatus.Available,

                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "SYSTEM",
                        IsDeleted = false
                    };

                    _context.InventoryBatches.Add(batch);
                    await _context.SaveChangesAsync();


                    // ⭐ PER PRODUCT TRANSACTION (MAIN FIX)
                    foreach (var item in dto.Items)
                    {
                        decimal netQty = Round2(item.Quantity);
                        decimal rate = Round2(item.Rate);

                        await PostBatchTransactionAsync(
                            batch,
                            netQty,
                            0,
                            rate,
                            invoice.InvoiceDate,
                            "PURCHASE",
                            invoice.InvoiceNo,
                            invoice.Id,
                            item.ProductId   // 🔥 MUST PASS THIS
                        );
                    }

                    await _context.SaveChangesAsync();
                }

                await trx.CommitAsync();

                return Ok(new { message = "Purchase Invoice Updated Successfully." });
            }
            catch (Exception ex)
            {
                await trx.RollbackAsync();
                return StatusCode(500, ex.Message);
            }
        }
        // =====================================================
        // ⭐ CORE: POST BATCH TRANSACTION (FIXED)
        // =====================================================
        private async Task PostBatchTransactionAsync(
            InventoryBatch batch,
            decimal qtyIn,
            decimal qtyOut,
            decimal unitCost,
            DateTime trxDate,
            string trxType,
            string sourceNo,
            long sourceId,
            long productId   // 🔥 FIXED (NO NULL)
        )
        {
            // 🔥 GET LAST BALANCE
            var lastBalance = await _context.InventoryBatchTransactions
                .Where(t => t.BatchId == batch.BatchId && t.ProductId == productId)
                .OrderByDescending(t => t.Id)
                .Select(t => t.RunningBalance)
                .FirstOrDefaultAsync();

            decimal running = lastBalance + qtyIn - qtyOut;

            var trx = new InventoryBatchTransaction
            {
                BatchId = batch.BatchId,

                // 🔥 FIX: always valid product
                ProductId = productId,

                TransactionDate = trxDate,
                TransactionType = trxType,

                SourceId = sourceId,
                SourceNo = sourceNo,

                QtyIn = qtyIn,
                QtyOut = qtyOut,
                RunningBalance = running,

                UnitCost = unitCost,

                // ⭐ ADD THIS (for remarks later)
                Remarks = trxType + " - " + sourceNo,

                CreatedAt = DateTime.UtcNow
            };

            _context.InventoryBatchTransactions.Add(trx);

            // 🔥 UPDATE BATCH TOTAL
            batch.QtyIn += qtyIn;
            batch.QtyOut += qtyOut;
            batch.QtyBalance += (qtyIn - qtyOut);
        }
        // =====================================================
        // DELETE ⭐ ERP SAFE HARD LOCK
        // =====================================================

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var invoice = await _context.PurchaseInvoices
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

            if (invoice == null)
                return NotFound("Purchase invoice not found.");

            // ⭐ VERY IMPORTANT ERP RULE
            if (invoice.Status == "Posted")
                return BadRequest("Posted invoice cannot be deleted.");

            invoice.IsDeleted = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Purchase invoice deleted successfully."
            });
        }

        // =====================================================
        // NEXT NUMBER
        // =====================================================

        [HttpGet("next-number")]
        public async Task<ActionResult<string>> GetNextNumber()
        {
            var now = DateTime.UtcNow;

            var month = now.Month.ToString("D2");
            var year = now.Year.ToString();

            var prefix = $"PINV-{month}{year}";

            var lastInvoice = await _context.PurchaseInvoices
                .Where(p => p.InvoiceNo.StartsWith(prefix))
                .OrderByDescending(p => p.Id)
                .Select(p => p.InvoiceNo)
                .FirstOrDefaultAsync();

            int nextSerial = 1;

            if (!string.IsNullOrEmpty(lastInvoice))
            {
                var serial = lastInvoice.Substring(prefix.Length);

                if (int.TryParse(serial, out int last))
                    nextSerial = last + 1;
            }

            var invoiceNo = $"{prefix}{nextSerial.ToString("D3")}";

            return Ok(invoiceNo);
        }
    }
}