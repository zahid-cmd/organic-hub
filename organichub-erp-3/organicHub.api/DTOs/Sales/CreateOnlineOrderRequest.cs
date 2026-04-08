using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.Sales
{
    public class CreateOnlineOrderRequest
    {
        [Required]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        public string Phone { get; set; } = string.Empty;

        public string? Address { get; set; }

        [Required]
        public List<CreateOnlineOrderItemDto> Items { get; set; } = new();
    }

    public class CreateOnlineOrderItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}