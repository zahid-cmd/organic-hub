using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.AccountSetup
{
    [Table("BankSetups")]
    public class BankSetup
    {
        [Key]
        public int Id { get; set; }

        // 🔥 System Generated (NOT Required from frontend)
        [MaxLength(20)]
        public string? BankCode { get; set; }   // BNK-001

        [Required]
        [MaxLength(150)]
        public string BankName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ShortName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? RoutingNumber { get; set; }

        [MaxLength(50)]
        public string? SwiftCode { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        // ===============================
        // AUDIT
        // ===============================

        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // ===============================
        // SOFT DELETE
        // ===============================
        public bool IsDeleted { get; set; } = false;
    }
}