using System;

namespace OrganicHub.Api.DTOs.Purchase
{
    public class PurchaseInvoiceListDto
    {
        public long Id { get; set; }

        public string InvoiceNo { get; set; } = string.Empty;

        public DateTime InvoiceDate { get; set; }

        public string SupplierName { get; set; } = string.Empty;

        public decimal ProductValue { get; set; }

        public decimal InvoiceValue { get; set; }

        public string? PurchaseOrderNo { get; set; }

        public DateTime? PurchaseOrderDate { get; set; }

        public string WarehouseName { get; set; } = string.Empty;

        public string Status { get; set; } = "Draft";   // ⭐ NEW
    }
}