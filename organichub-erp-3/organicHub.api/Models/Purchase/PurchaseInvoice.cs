using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrganicHub.Api.Models.ClientManagement;
using OrganicHub.Api.Models.GeneralSetup;

namespace OrganicHub.Api.Models.Purchase
{
    public class PurchaseInvoice
    {
        [Key]
        public long Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string InvoiceNo { get; set; } = string.Empty;

        [Required]
        public DateTime InvoiceDate { get; set; }

        /* ================= SUPPLIER ================= */

        public int SupplierId { get; set; }

        [ForeignKey(nameof(SupplierId))]
        public Supplier Supplier { get; set; } = null!;

        /* ================= PURCHASE TYPE ================= */

        public int? PurchaseTypeId { get; set; }

        /* ================= PURCHASE ORDER ================= */

        public long? PurchaseOrderId { get; set; }

        [ForeignKey(nameof(PurchaseOrderId))]
        public PurchaseOrder? PurchaseOrder { get; set; }

        /* ================= WAREHOUSE ⭐ ERP CORE ================= */

        // ⭐ MUST BE LONG (BIGINT ERP STANDARD)
        public long WarehouseId { get; set; }

        [ForeignKey(nameof(WarehouseId))]
        public Warehouse Warehouse { get; set; } = null!;

        /* ================= OTHER DETAILS ================= */

        [MaxLength(200)]
        public string? Reference { get; set; }

        public decimal PrimaryTransport { get; set; }
        public decimal SecondaryTransport { get; set; }
        public decimal Discount { get; set; }

        public decimal ProductValue { get; set; }
        public decimal TotalAmount { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Draft";

        public string? Notes { get; set; }

        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<PurchaseInvoiceItem> Items
            = new List<PurchaseInvoiceItem>();
    }
}