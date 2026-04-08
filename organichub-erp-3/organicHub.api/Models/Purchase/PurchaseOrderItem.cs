using OrganicHub.Api.Models.ProductManagement;

namespace OrganicHub.Api.Models.Purchase
{
    public class PurchaseOrderItem
    {
        public long Id { get; set; }

        // ===============================
        // RELATION → PURCHASE ORDER
        // ===============================
        public long PurchaseOrderId { get; set; }
        public PurchaseOrder PurchaseOrder { get; set; } = null!;

        // ===============================
        // RELATION → PRODUCT
        // ===============================
        public long ProductId { get; set; }
        public Product Product { get; set; } = null!;

        // ===============================
        // VALUES
        // ===============================
        public decimal Quantity { get; set; }
        public decimal Rate { get; set; }
        public decimal Amount { get; set; }
    }
}