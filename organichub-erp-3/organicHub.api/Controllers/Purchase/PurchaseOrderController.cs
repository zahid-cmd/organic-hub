using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrganicHub.Api.Data;
using OrganicHub.Api.DTOs.Purchase;
using OrganicHub.Api.Models.Purchase;

namespace OrganicHub.Api.Controllers.Purchase
{
    [ApiController]
    [Route("api/PurchaseOrder")]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PurchaseOrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET ALL
        // =====================================================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseOrderListDto>>> GetAll()
        {
            var orders = await _context.PurchaseOrders
                .AsNoTracking()
                .Include(o => o.Supplier)
                .Where(o => !o.IsDeleted)
                .OrderByDescending(o => o.Id)
                .Select(o => new PurchaseOrderListDto
                {
                    Id = o.Id,
                    OrderNo = o.OrderNo,
                    OrderDate = o.OrderDate,
                    SupplierName = o.Supplier.SupplierName,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status
                })
                .ToListAsync();

            return Ok(orders);
        }

        // =====================================================
        // GET APPROVED ORDERS (FOR PURCHASE INVOICE)
        // =====================================================
        [HttpGet("approved")]
        public async Task<ActionResult<IEnumerable<object>>> GetApprovedOrders()
        {
            var orders = await _context.PurchaseOrders
                .AsNoTracking()
                .Where(o =>
                    !o.IsDeleted &&
                    o.Status == "Approved" &&
                    !_context.PurchaseInvoices.Any(i =>
                        !i.IsDeleted &&
                        i.PurchaseOrderId == o.Id
                    )
                )
                .OrderByDescending(o => o.Id)
                .Select(o => new
                {
                    id = o.Id,
                    orderNo = o.OrderNo,
                    orderDate = o.OrderDate,
                    supplierId = o.SupplierId,
                    purchaseTypeId = o.PurchaseTypeId   // ⭐ ADD THIS
                })
                .ToListAsync();

            return Ok(orders);
        }

        // =====================================================
        // GET PURCHASE ORDERS FOR INVOICE (APPROVED + PROCESSED)
        // =====================================================
        [HttpGet("for-invoice")]
        public async Task<ActionResult<IEnumerable<object>>> GetPurchaseOrdersForInvoice()
        {
            var orders = await _context.PurchaseOrders
                .AsNoTracking()
                .Where(o =>
                    !o.IsDeleted &&
                    (o.Status == "Approved" || o.Status == "Processed")
                )
                .OrderByDescending(o => o.Id)
                .Select(o => new
                {
                    id = o.Id,
                    orderNo = o.OrderNo,
                    supplierId = o.SupplierId,
                    purchaseTypeId = o.PurchaseTypeId
                })
                .ToListAsync();

            return Ok(orders);
        }
        // =====================================================
        // GET BY ID
        // =====================================================
        [HttpGet("{id:long}")]
        public async Task<ActionResult<PurchaseOrderDetailsDto>> GetById(long id)
        {
            var order = await _context.PurchaseOrders
                .AsNoTracking()
                .Include(o => o.Supplier)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

            if (order == null)
                return NotFound("Purchase order not found.");

            var result = new PurchaseOrderDetailsDto
            {
                Id = order.Id,
                OrderNo = order.OrderNo,
                OrderDate = order.OrderDate,
                SupplierId = order.SupplierId,
                PurchaseTypeId = order.PurchaseTypeId,   // ⭐ VERY IMPORTANT

                SupplierName = order.Supplier?.SupplierName,
                SupplierPhone = order.Supplier?.Phone,
                SupplierAddress = order.Supplier?.Address,

                TotalAmount = order.TotalAmount,
                Status = order.Status,
                Notes = order.Notes,

                Items = order.Items.Select(i => new PurchaseOrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product.ProductName,
                    Quantity = i.Quantity,
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
        public async Task<IActionResult> Create(PurchaseOrderCreateDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid request.");

            if (dto.SupplierId <= 0)
                return BadRequest("Supplier required.");

            if (dto.PurchaseTypeId == null)
                return BadRequest("Purchase Type required.");

            if (dto.Items == null || !dto.Items.Any())
                return BadRequest("At least one item required.");

            var supplierExists =
                await _context.Suppliers.AnyAsync(s => s.Id == dto.SupplierId);

            if (!supplierExists)
                return BadRequest("Invalid supplier.");

            // ---------- NUMBER ENGINE ----------

            var now = DateTime.UtcNow;
            var prefix = $"PO-{now:MM}{now:yyyy}";

            var lastNo = await _context.PurchaseOrders
                .Where(x => x.OrderNo.StartsWith(prefix))
                .OrderByDescending(x => x.Id)
                .Select(x => x.OrderNo)
                .FirstOrDefaultAsync();

            int next = 1;

            if (!string.IsNullOrEmpty(lastNo))
            {
                var serial = lastNo.Substring(prefix.Length);
                if (int.TryParse(serial, out int last))
                    next = last + 1;
            }

            var orderNo = $"{prefix}{next:000}";

            // ---------- HEADER SAVE ----------

            var order = new PurchaseOrder
            {
                OrderNo = orderNo,
                OrderDate = DateTime.SpecifyKind(dto.OrderDate, DateTimeKind.Utc),
                SupplierId = dto.SupplierId,
                PurchaseTypeId = dto.PurchaseTypeId,   // ⭐ SAVE
                Status = dto.Status ?? "Draft",
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.PurchaseOrders.Add(order);
            await _context.SaveChangesAsync();

            // ---------- ITEM SAVE ----------

            decimal total = 0;

            foreach (var item in dto.Items)
            {
                var amount = item.Quantity * item.Rate;

                _context.PurchaseOrderItems.Add(new PurchaseOrderItem
                {
                    PurchaseOrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Amount = amount
                });

                total += amount;
            }

            order.ProductValue = total;
            order.TotalAmount = total;

            await _context.SaveChangesAsync();

            return Ok(new { orderId = order.Id, orderNo = order.OrderNo });
        }

        // =====================================================
        // UPDATE
        // =====================================================
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, PurchaseOrderCreateDto dto)
        {
            var order = await _context.PurchaseOrders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

            if (order == null)
                return NotFound("Purchase order not found.");

            if (order.Status == "Processed")
                return BadRequest("Processed order cannot be edited.");

            order.SupplierId = dto.SupplierId;
            order.PurchaseTypeId = dto.PurchaseTypeId;   // ⭐ SAVE
            order.Status = dto.Status ?? "Draft";
            order.Notes = dto.Notes;
            order.OrderDate = DateTime.SpecifyKind(dto.OrderDate, DateTimeKind.Utc);

            _context.PurchaseOrderItems.RemoveRange(order.Items);

            decimal total = 0;

            foreach (var item in dto.Items)
            {
                var amount = item.Quantity * item.Rate;

                _context.PurchaseOrderItems.Add(new PurchaseOrderItem
                {
                    PurchaseOrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Rate = item.Rate,
                    Amount = amount
                });

                total += amount;
            }

            order.ProductValue = total;
            order.TotalAmount = total;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Purchase order updated." });
        }
        // =====================================================
        // DELETE
        // =====================================================
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var order = await _context.PurchaseOrders
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

            if (order == null)
                return NotFound("Purchase order not found.");

            order.IsDeleted = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Purchase order deleted successfully."
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

            var prefix = $"PO-{month}{year}";

            var lastOrder = await _context.PurchaseOrders
                .Where(p => p.OrderNo.StartsWith(prefix))
                .OrderByDescending(p => p.Id)
                .Select(p => p.OrderNo)
                .FirstOrDefaultAsync();

            int nextSerial = 1;

            if (!string.IsNullOrEmpty(lastOrder))
            {
                var serial = lastOrder.Substring(prefix.Length);

                if (int.TryParse(serial, out int last))
                    nextSerial = last + 1;
            }

            var orderNo = $"{prefix}{nextSerial.ToString("D3")}";

            return Ok(orderNo);
        }
    }
}