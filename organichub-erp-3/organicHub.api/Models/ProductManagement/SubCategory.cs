using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.ProductManagement
{
    [Table("SubCategories")]
    public class SubCategory
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string SubCategoryCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string SubCategoryName { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public Category? Category { get; set; }

        public int? SortOrder { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(255)]
        public string? Remarks { get; set; }

        [Required]
        public string CreatedBy { get; set; } = "System";

        [Required]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        // Navigation (for future ERP linking)
        public ICollection<Product> Products { get; set; }
            = new List<Product>();
    }
}
