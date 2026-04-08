using System;
using System.Collections.Generic;
using OrganicHub.Api.Models.ClientManagement;
using OrganicHub.Api.Models.ProductManagement;

namespace OrganicHub.Api.Models.Purchase
{
    public class PurchaseOrder
    {
        public long Id { get; set; }

        // ===============================
        // BASIC INFO
        // ===============================
        public string OrderNo { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; }

        public string? Notes { get; set; }

        // ===============================
        // SUPPLIER
        // ===============================
        public int SupplierId { get; set; }
        public Supplier Supplier { get; set; } = null!;

        // ===============================
        // PURCHASE TYPE ⭐ NEW
        // ===============================
        public int? PurchaseTypeId { get; set; }
        public ProductType? PurchaseType { get; set; }

        // ===============================
        // FINANCIALS
        // ===============================
        public decimal ProductValue { get; set; }
        public decimal Transportation { get; set; }
        public decimal Discount { get; set; }
        public decimal TotalAmount { get; set; }

        // ===============================
        // STATUS
        // ===============================
        public string Status { get; set; } = "Draft";

        // ===============================
        // ITEMS
        // ===============================
        public ICollection<PurchaseOrderItem> Items { get; set; }
            = new List<PurchaseOrderItem>();

        // ===============================
        // AUDIT
        // ===============================
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ===============================
        // SOFT DELETE
        // ===============================
        public bool IsDeleted { get; set; } = false;
    }
}