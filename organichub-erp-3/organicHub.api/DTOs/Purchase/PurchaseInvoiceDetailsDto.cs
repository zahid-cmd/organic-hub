using System;
using System.Collections.Generic;

namespace OrganicHub.Api.DTOs.Purchase
{
    public class PurchaseInvoiceDetailsDto
    {
        public long Id { get; set; }

        public string InvoiceNo { get; set; } = string.Empty;

        public DateTime InvoiceDate { get; set; }

        public int SupplierId { get; set; }

        public int? PurchaseTypeId { get; set; }

        public string? SupplierName { get; set; }
        public string? SupplierPhone { get; set; }
        public string? SupplierAddress { get; set; }

        public long? PurchaseOrderId { get; set; }

        public long WarehouseId { get; set; }

        public string? Reference { get; set; }

        public decimal PrimaryTransport { get; set; }
        public decimal SecondaryTransport { get; set; }
        public decimal Discount { get; set; }

        public decimal ProductValue { get; set; }
        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = "Draft";   // ⭐ FINAL SAFE

        public string? Notes { get; set; }

        public List<PurchaseInvoiceItemDto> Items { get; set; }
            = new();
    }
}