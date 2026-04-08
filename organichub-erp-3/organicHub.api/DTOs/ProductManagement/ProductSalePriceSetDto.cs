namespace OrganicHub.Api.DTOs.ProductManagement
{
    public class ProductSalePriceSetDto
    {
        public long ProductId { get; set; }
        public decimal Price { get; set; }
        public string? Status { get; set; }
    }
}