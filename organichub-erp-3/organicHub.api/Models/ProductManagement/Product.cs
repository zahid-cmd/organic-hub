using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.ProductManagement
{
    public class Product
    {
        // =============================
        // PRIMARY KEY
        // =============================
        [Key]
        public long Id { get; set; }

        // =============================
        // IDENTIFICATION
        // =============================
        [Required]
        [MaxLength(50)]
        public string ProductCode { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? SKU { get; set; }

        [MaxLength(100)]
        public string? Barcode { get; set; }

        [Required]
        [MaxLength(200)]
        public string ProductName { get; set; } = string.Empty;

        // =============================
        // CLASSIFICATION (FK)
        // =============================
        [Required]
        public int ProductTypeId { get; set; }

        [ForeignKey(nameof(ProductTypeId))]
        public ProductType? ProductType { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public Category? Category { get; set; }

        [Required]
        public int SubCategoryId { get; set; }

        [ForeignKey(nameof(SubCategoryId))]
        public SubCategory? SubCategory { get; set; }

        [Required]
        public int UnitId { get; set; }

        [ForeignKey(nameof(UnitId))]
        public Unit? Unit { get; set; }

        // =============================
        // RELATIONSHIP
        // =============================
        public ICollection<ProductImage>? ProductImages { get; set; }

        // =============================
        // SYSTEM
        // =============================
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(255)]
        public string? Remarks { get; set; }

        public bool IsDeleted { get; set; } = false;
        // =============================
        // FINANCIAL LEDGER MAPPING ⭐ ERP CORE
        // =============================
        public int? InventoryLedgerId { get; set; }

        [ForeignKey(nameof(InventoryLedgerId))]
        public OrganicHub.Api.Models.AccountSetup.GeneralLedger? InventoryLedger { get; set; }

        public int? CogsLedgerId { get; set; }

        [ForeignKey(nameof(CogsLedgerId))]
        public OrganicHub.Api.Models.AccountSetup.GeneralLedger? CogsLedger { get; set; }
        // =============================
        // AUDIT
        // =============================
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