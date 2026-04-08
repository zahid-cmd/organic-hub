using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.AccountSetup
{
    [Table("GeneralLedgers")]
    public class GeneralLedger
    {
        // ===============================
        // PRIMARY KEY
        // ===============================
        [Key]
        public int Id { get; set; }

        // ===============================
        // BASIC INFORMATION
        // ===============================
        [Required]
        [MaxLength(50)]
        public string LedgerCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string LedgerName { get; set; } = string.Empty;

        [Required]
        public int SubGroupId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(500)]
        public string? Remarks { get; set; }

        // ===============================
        // AUDIT FIELDS
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

        // ===============================
        // NAVIGATION → AccountSubGroup
        // ===============================
        [ForeignKey(nameof(SubGroupId))]
        public AccountSubGroup? AccountSubGroup { get; set; }
    }
}