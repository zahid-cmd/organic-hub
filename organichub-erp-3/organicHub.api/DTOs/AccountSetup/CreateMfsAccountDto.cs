using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.AccountSetup
{
    public class CreateMfsAccountDto
    {
        // =====================================================
        // BASIC INFORMATION
        // =====================================================

        [Required(ErrorMessage = "Account Code is required.")]
        [MaxLength(50)]
        public string AccountCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Account Name is required.")]
        [MaxLength(150)]
        public string AccountName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Short Account Name is required.")]
        [MaxLength(100)]
        public string ShortAccountName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Wallet / Merchant Number is required.")]
        [MaxLength(50)]
        public string WalletOrMerchantNumber { get; set; } = string.Empty;

        // =====================================================
        // FOREIGN KEYS
        // =====================================================

        [Required(ErrorMessage = "Branch is required.")]
        public int BranchId { get; set; }

        // Optional Linked Bank Account
        public int? LinkedBankAccountId { get; set; }

        // =====================================================
        // OPERATIONAL FLAGS
        // =====================================================

        [Required]
        public bool IsCollectionAccount { get; set; }

        [Required]
        public bool IsPaymentAccount { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        // =====================================================
        // OPTIONAL
        // =====================================================

        [MaxLength(500)]
        public string? Remarks { get; set; }
    }
}