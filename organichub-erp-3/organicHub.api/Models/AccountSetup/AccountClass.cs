using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.AccountSetup
{
    [Table("AccountClasses")]
    public class AccountClass
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string ClassCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string ClassName { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string ClassMode { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(500)]
        public string? Remarks { get; set; }

        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;

        public ICollection<AccountGroup> AccountGroups { get; set; }
            = new List<AccountGroup>();
    }
}