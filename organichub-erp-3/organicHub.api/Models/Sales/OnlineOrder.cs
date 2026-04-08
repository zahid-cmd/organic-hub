using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.Models.Sales
{
    public class OnlineOrder
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(30)]
        public string OrderNo { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(150)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Address { get; set; }

        public decimal SubTotal { get; set; }

        public decimal DeliveryCharge { get; set; }

        public decimal TotalAmount { get; set; }

        // =============================
        // STATUS
        // =============================

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        public bool IsConverted { get; set; } = false;

        public bool IsDeleted { get; set; } = false;

        // =============================
        // AUDIT
        // =============================

        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // =============================
        // NAVIGATION
        // =============================

        public List<OnlineOrderItem> Items { get; set; } = new();
    }
}