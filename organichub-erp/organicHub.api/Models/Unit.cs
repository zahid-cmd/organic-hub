using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models
{
    public class Unit
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string UnitCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string UnitName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(255)]
        public string? Remarks { get; set; }

        // =============================
        // AUDIT
        // =============================

        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}
