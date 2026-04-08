namespace OrganicHub.Api.DTOs.Purchase
{
    public class PurchaseOrderItemDto
    {
        public long ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;   // ✅ ADD THIS

        public decimal Quantity { get; set; }

        public decimal Rate { get; set; }

        public decimal Amount { get; set; }
    }
}