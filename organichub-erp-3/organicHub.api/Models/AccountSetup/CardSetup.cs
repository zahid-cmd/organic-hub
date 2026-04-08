using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.Models.AccountSetup
{
    public class CardSetup
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string CardCode { get; set; } = string.Empty;

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

        // ================= AUDIT =================
        public string CreatedBy { get; set; } = "System";
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}