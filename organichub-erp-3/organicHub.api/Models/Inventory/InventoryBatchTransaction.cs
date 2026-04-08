using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrganicHub.Api.Models.ProductManagement;

namespace OrganicHub.Api.Models.Inventory
{
    public class InventoryBatchTransaction
    {
        // ===============================
        // PRIMARY KEY
        // ===============================
        [Key]
        public long Id { get; set; }

        // ===============================
        // FK → INVENTORY BATCH
        // ===============================
        [Required]
        public long BatchId { get; set; }

        [ForeignKey(nameof(BatchId))]
        public InventoryBatch Batch { get; set; } = null!;


        // ===============================
        // ⭐ NEW: FK → PRODUCT (CRITICAL FIX)
        // ===============================
        [Required]
        public long ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public Product Product { get; set; } = null!;


        // ===============================
        // TRANSACTION INFO
        // ===============================
        [Required]
        public DateTime TransactionDate { get; set; }

        [Required]
        [MaxLength(30)]
        public string TransactionType { get; set; } = string.Empty;


        // ===============================
        // SOURCE TRACKING
        // ===============================
        public long SourceId { get; set; }

        [MaxLength(50)]
        public string SourceNo { get; set; } = string.Empty;


        // ===============================
        // QUANTITY MOVEMENT
        // ===============================
        [Column(TypeName = "decimal(18,4)")]
        public decimal QtyIn { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QtyOut { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal RunningBalance { get; set; }


        // ===============================
        // COSTING
        // ===============================
        [Column(TypeName = "decimal(18,4)")]
        public decimal UnitCost { get; set; }

        [MaxLength(250)]
        public string? Remarks { get; set; }
        // ===============================
        // AUDIT
        // ===============================
        [Required]
        public DateTime CreatedAt { get; set; }
    }
}