using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.AccountSetup
{
    public class CreateCardChargeDto
    {
        [Required]
        public int PosLedgerId { get; set; }

        [Required]
        public int CardSetupId { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal ChargePercent { get; set; }

        [MaxLength(500)]
        public string? Remarks { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";
    }
}