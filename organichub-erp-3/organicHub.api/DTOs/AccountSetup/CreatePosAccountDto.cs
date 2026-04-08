using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.AccountSetup
{
    public class CreatePosAccountDto
    {
        // =====================================================
        // BASIC INFORMATION
        // =====================================================

        [Required(ErrorMessage = "Account Code is required.")]
        [MaxLength(50)]
        public string AccountCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Terminal / Merchant ID is required.")]
        [MaxLength(100)]
        public string TerminalOrMerchantId { get; set; } = string.Empty;

        // =====================================================
        // FOREIGN KEYS
        // =====================================================

        [Required(ErrorMessage = "Branch is required.")]
        public int BranchId { get; set; }

        [Required(ErrorMessage = "Linked Bank Account is required.")]
        public int? LinkedBankAccountId { get; set; }

        // =====================================================
        // OPERATIONAL FLAGS
        // =====================================================

        public bool IsCollectionAccount { get; set; }

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