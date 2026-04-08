namespace OrganicHub.Api.DTOs.Sales
{
    public class OnlineOrderUpdateRequest
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Address { get; set; }
        public decimal DeliveryCharge { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<OnlineOrderItemUpdateRequest> Items { get; set; } = new();
    }

    public class OnlineOrderItemUpdateRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}