namespace OrganicHub.Api.DTOs.Purchase
{
    public class PurchaseOrderListDto
    {
        public long Id { get; set; }

        public string OrderNo { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; }

        public string SupplierName { get; set; } = string.Empty;

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}