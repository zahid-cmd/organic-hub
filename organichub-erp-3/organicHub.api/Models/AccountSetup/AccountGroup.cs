using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.AccountSetup
{
    [Table("AccountGroups")]
    public class AccountGroup
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string GroupCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string GroupName { get; set; } = string.Empty;

        [Required]
        public int AccountClassId { get; set; }

        [ForeignKey(nameof(AccountClassId))]
        public AccountClass? AccountClass { get; set; }

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

        public ICollection<AccountSubGroup> AccountSubGroups { get; set; }
            = new List<AccountSubGroup>();
    }
}