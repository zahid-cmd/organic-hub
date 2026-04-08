using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrganicHub.Api.Models.ProductManagement;
using OrganicHub.Api.Models.GeneralSetup;

namespace OrganicHub.Api.Models.Inventory
{
    public class InventoryBatch
    {
        [Key]
        public long BatchId { get; set; }

        [Required]
        [MaxLength(30)]
        public string BatchNo { get; set; } = string.Empty;

        // ===============================
        // ⭐ DOCUMENT LEVEL BATCH (PRODUCT OPTIONAL)
        // ===============================
        public long? ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public Product? Product { get; set; }

        // ===============================
        // WAREHOUSE
        // ===============================
        [Required]
        public long WarehouseId { get; set; }

        [ForeignKey(nameof(WarehouseId))]
        public Warehouse Warehouse { get; set; } = null!;

        // ===============================
        // SOURCE TRACKING
        // ===============================
        [Required]
        public InventorySourceType SourceType { get; set; }

        public long SourceId { get; set; }

        [MaxLength(50)]
        public string? SourceNo { get; set; }

        // ===============================
        // QUANTITY
        // ===============================
        [Column(TypeName = "decimal(18,4)")]
        public decimal QtyIn { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QtyOut { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QtyBalance { get; set; }

        // ===============================
        // COST
        // ===============================
        [Column(TypeName = "decimal(18,4)")]
        public decimal UnitCost { get; set; }

        // ===============================
        // DATE INFO
        // ===============================
        public DateTime BatchDate { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public InventoryBatchStatus BatchStatus { get; set; }

        // ===============================
        // AUDIT
        // ===============================
        public DateTime CreatedAt { get; set; }

        [MaxLength(50)]
        public string? CreatedBy { get; set; }

        public bool IsDeleted { get; set; }

        // ===============================
        // ⭐ ERP CORE NAVIGATION
        // ===============================
        public ICollection<InventoryBatchTransaction> Transactions { get; set; }
            = new List<InventoryBatchTransaction>();
    }
}