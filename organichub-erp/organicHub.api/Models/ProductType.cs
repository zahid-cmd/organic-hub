using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.Models
{
    public class ProductType
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string TypeCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string TypeName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(255)]
        public string? Remarks { get; set; }

        // ✅ Business Behaviour Only
        public bool IsPurchasable { get; set; }
        public bool IsSellable { get; set; }
        public bool IsProductionItem { get; set; }

        // ===== Audit =====
        public string CreatedBy { get; set; } = "System";
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // ✅ KEEP THIS (VERY IMPORTANT)
        public ICollection<Product> Products { get; set; }
            = new List<Product>();
    }
}
