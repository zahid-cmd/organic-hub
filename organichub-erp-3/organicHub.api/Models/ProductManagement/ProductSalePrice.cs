using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.ProductManagement
{
    public class ProductSalePrice
    {
        public long Id { get; set; }

        // =========================================
        // RELATION
        // =========================================
        [Required]
        public long ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public Product Product { get; set; } = null!;

        // =========================================
        // PRICE INFORMATION
        // =========================================
        [Required]
        public decimal Price { get; set; }

        public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
        public DateTime? EffectiveTo { get; set; }

        public bool IsCurrent { get; set; } = true;

        [Required]
        public string Status { get; set; } = "Active";

        // 🔥 NEW (Required for History Drawer)
        public string? Remarks { get; set; }

        // =========================================
        // AUDIT
        // =========================================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }
}