using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.ProductManagement
{
    public class ProductImage
    {
        [Key]
        public long Id { get; set; }  // FIXED

        [Required]
        public long ProductId { get; set; }  // FIXED

        [ForeignKey(nameof(ProductId))]
        public Product Product { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        public bool IsPrimary { get; set; } = false;

        public int DisplayOrder { get; set; } = 0;

        public bool IsDeleted { get; set; } = false;

        [Required]
        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        [Required]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}