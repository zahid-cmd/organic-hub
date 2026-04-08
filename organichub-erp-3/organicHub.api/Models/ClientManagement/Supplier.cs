using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrganicHub.Api.Models.AccountSetup;

namespace OrganicHub.Api.Models.ClientManagement
{
    public class Supplier
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string SupplierCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string SupplierName { get; set; } = string.Empty;

        [Required]
        public int AccountSubGroupId { get; set; }

        [ForeignKey(nameof(AccountSubGroupId))]
        public AccountSubGroup? AccountSubGroup { get; set; }

        [MaxLength(150)]
        public string? ContactPerson { get; set; }

        [MaxLength(50)]
        public string? PrimaryPhone { get; set; }

        [MaxLength(50)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(500)]
        public string? Remarks { get; set; }

        public bool IsDeleted { get; set; } = false;

        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string UpdatedBy { get; set; } = "System";

        public DateTime? UpdatedDate { get; set; }
    }
}