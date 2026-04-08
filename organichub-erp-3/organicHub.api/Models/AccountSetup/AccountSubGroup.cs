using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.AccountSetup
{
    [Table("AccountSubGroups")]
    public class AccountSubGroup
    {
        // ===============================
        // PRIMARY KEY
        // ===============================
        [Key]
        public int Id { get; set; }

        // ===============================
        // BASIC INFORMATION
        // ===============================
        [Required]
        [MaxLength(50)]
        public string SubGroupCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string SubGroupName { get; set; } = string.Empty;

        [Required]
        public int GroupId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(500)]
        public string? Remarks { get; set; }

        // ===============================
        // AUDIT FIELDS
        // ===============================
        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // ===============================
        // SOFT DELETE
        // ===============================
        public bool IsDeleted { get; set; } = false;

        // ===============================
        // NAVIGATION → AccountGroup
        // ===============================
        [ForeignKey(nameof(GroupId))]
        public AccountGroup? AccountGroup { get; set; }
    }
}