using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrganicHub.Api.Models.GeneralSetup;

namespace OrganicHub.Api.Models.AccountSetup
{
    [Table("PosAccounts")]
    public class PosAccount
    {
        // =====================================
        // PRIMARY KEY ⭐ ERP RULE → BIGINT
        // =====================================
        [Key]
        public long Id { get; set; }

        // ================= BASIC =================

        [Required]
        [MaxLength(50)]
        public string AccountCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string AccountName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ShortAccountName { get; set; } = string.Empty;

        // Terminal / Merchant ID
        [Required]
        [MaxLength(100)]
        public string TerminalOrMerchantId { get; set; } = string.Empty;

        // Auto Generated Ledger Name
        [Required]
        [MaxLength(200)]
        public string PosLedgerName { get; set; } = string.Empty;

        // ================= FK ⭐ MUST BE LONG =================

        [Required]
        public long BranchId { get; set; }

        [Required]
        public int SubGroupId { get; set; }
        public long? LinkedBankAccountId { get; set; }

        // ================= FLAGS =================

        public bool IsCollectionAccount { get; set; }
        public bool IsPaymentAccount { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(500)]
        public string? Remarks { get; set; }

        // ================= AUDIT =================

        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;

        // ================= NAV =================

        [ForeignKey(nameof(BranchId))]
        public Branch Branch { get; set; } = null!;

        [ForeignKey(nameof(SubGroupId))]
        public AccountSubGroup AccountSubGroup { get; set; } = null!;

        [ForeignKey(nameof(LinkedBankAccountId))]
        public BankAccount? LinkedBankAccount { get; set; }
    }
}