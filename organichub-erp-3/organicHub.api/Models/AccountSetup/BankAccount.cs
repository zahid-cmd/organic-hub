using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrganicHub.Api.Models.GeneralSetup;

namespace OrganicHub.Api.Models.AccountSetup
{
    [Table("BankAccounts")]
    public class BankAccount
    {
        // ⭐ ERP STANDARD → BIGINT PK (Transaction / Financial Master)
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
        [MaxLength(200)]
        public string BankAccountName { get; set; } = string.Empty;

        // ================= STORED TITLES =================

        [MaxLength(200)]
        public string? FullAccountTitle { get; set; }

        [MaxLength(100)]
        public string? ShortAccountTitle { get; set; }

        [MaxLength(100)]
        public string? FullAccountNumber { get; set; }

        [MaxLength(50)]
        public string? ShortAccountNumber { get; set; }

        [MaxLength(100)]
        public string? ShortBankName { get; set; }

        // ⭐ Future Ready → Bank PK will be long
        public long? BankId { get; set; }

        // ================= COMPANY BRANCH =================

        [Required]
        public long BranchId { get; set; }

        [ForeignKey(nameof(BranchId))]
        public Branch Branch { get; set; } = null!;

        // ================= ACCOUNT SUB GROUP =================
        // ⭐ FIXED TYPE → MUST MATCH AccountSubGroup.Id (int)

        [Required]
        public int SubGroupId { get; set; }

        [ForeignKey(nameof(SubGroupId))]
        public AccountSubGroup AccountSubGroup { get; set; } = null!;

        // ================= BANK BRANCH =================

        [Required]
        [MaxLength(150)]
        public string BankBranchName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? BankShortBranchName { get; set; }

        // ================= FLAGS =================

        public bool IsCollectionAccount { get; set; }
        public bool IsPaymentAccount { get; set; }

        [Required]
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

        // ================= SOFT DELETE =================

        public bool IsDeleted { get; set; } = false;
    }
}