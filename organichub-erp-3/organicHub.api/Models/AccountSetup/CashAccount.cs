using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrganicHub.Api.Models.GeneralSetup;

namespace OrganicHub.Api.Models.AccountSetup
{
    [Table("CashAccounts")]
    public class CashAccount
    {
        // =====================================
        // PRIMARY KEY ⭐ ERP RULE → BIGINT
        // =====================================
        [Key]
        public long Id { get; set; }

        // =====================================
        // BASIC INFORMATION
        // =====================================

        [Required]
        [MaxLength(50)]
        public string AccountCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string AccountName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string CashAccountName { get; set; } = string.Empty;

        // =====================================
        // FOREIGN KEYS
        // =====================================

        [Required]
        public long BranchId { get; set; }

        [Required]
        public int SubGroupId { get; set; }   // ⭐ FIXED

        // =====================================
        // CASH FLAGS
        // =====================================

        public bool IsCollectionAccount { get; set; }
        public bool IsPaymentAccount { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(500)]
        public string? Remarks { get; set; }

        // =====================================
        // AUDIT FIELDS
        // =====================================

        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // =====================================
        // SOFT DELETE
        // =====================================

        public bool IsDeleted { get; set; } = false;

        // =====================================
        // NAVIGATION PROPERTIES
        // =====================================

        [ForeignKey(nameof(BranchId))]
        public Branch Branch { get; set; } = null!;

        [ForeignKey(nameof(SubGroupId))]
        public AccountSubGroup AccountSubGroup { get; set; } = null!;
    }
}