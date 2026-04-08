using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrganicHub.Api.Models.AccountSetup;

namespace OrganicHub.Api.Models.ClientManagement
{
    [Table("Customer")] // 🔥 IMPORTANT: Match existing DB table EXACTLY
    public class Customer
    {
        // ==============================
        // PRIMARY KEY
        // ==============================
        [Key]
        public int Id { get; set; }

        // ==============================
        // CUSTOMER CODE
        // ==============================
        [Required]
        [MaxLength(50)]
        public string CustomerCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string CustomerName { get; set; } = string.Empty;

        // ==============================
        // FOREIGN KEY → AccountSubGroup
        // ==============================
        [Required]
        public int AccountSubGroupId { get; set; }

        [ForeignKey(nameof(AccountSubGroupId))]
        public AccountSubGroup? AccountSubGroup { get; set; }

        // ==============================
        // CONTACT INFORMATION
        // ==============================
        [MaxLength(50)]
        public string? PrimaryPhone { get; set; }

        [MaxLength(50)]
        public string? SecondaryPhone { get; set; }

        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        [MaxLength(500)]
        public string? Remarks { get; set; }

        // ==============================
        // STATUS & CONTROL
        // ==============================
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        public bool IsDeleted { get; set; } = false;

        // ==============================
        // AUDIT FIELDS
        // ==============================
        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string UpdatedBy { get; set; } = "System";

        public DateTime? UpdatedDate { get; set; }
    }
}