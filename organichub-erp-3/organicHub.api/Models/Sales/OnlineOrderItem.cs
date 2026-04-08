using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.Sales
{
    public class OnlineOrderItem
    {
        public int Id { get; set; }

        [Required]
        public int OnlineOrderId { get; set; }

        [ForeignKey(nameof(OnlineOrderId))]
        public OnlineOrder OnlineOrder { get; set; } = null!;

        [Required]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(200)]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }

        [Required]
        public decimal LineTotal { get; set; }
    }
}