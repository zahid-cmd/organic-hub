using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.AccountSetup
{
    [Table("CardCharges")]
    public class CardCharge
    {
        [Key]
        public int Id { get; set; }

        // ==============================
        // RELATION → POS ACCOUNT (LEDGER → BIGINT)
        // ==============================

        [Required]
        public long PosLedgerId { get; set; }   // ⭐ FIXED

        [ForeignKey(nameof(PosLedgerId))]
        public PosAccount PosLedger { get; set; } = null!;

        // ==============================
        // RELATION → CARD SETUP
        // ==============================

        [Required]
        public int CardSetupId { get; set; }

        [ForeignKey(nameof(CardSetupId))]
        public CardSetup CardSetup { get; set; } = null!;

        // ==============================
        // DATA
        // ==============================

        [Required]
        [Range(0, 100)]
        public decimal ChargePercent { get; set; }

        [MaxLength(500)]
        public string? Remarks { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        // ==============================
        // AUDIT
        // ==============================

        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}