using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.AccountSetup
{
    public class CreateCardSetupDto
    {
        [Required]
        [MaxLength(100)]
        public string CardName { get; set; } = string.Empty;

        // ✅ REPLACED BankName WITH IssuingBank
        [Required]
        [MaxLength(150)]
        public string IssuingBank { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Remarks { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";
    }
}