using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models
{
    public class Category
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string CategoryCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        // ==============================
        // 🔥 NEW DEPENDENCY
        // ==============================
        [Required]
        public int ProductTypeId { get; set; }

        [ForeignKey("ProductTypeId")]
        public ProductType? ProductType { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(255)]
        public string? Remarks { get; set; }

        // ===== Audit =====
        public string CreatedBy { get; set; } = "System";
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // ===== Navigation =====
        public ICollection<SubCategory> SubCategories { get; set; }
            = new List<SubCategory>();
    }
}
