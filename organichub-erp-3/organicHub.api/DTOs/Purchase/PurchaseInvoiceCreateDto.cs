using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.Purchase
{
    public class PurchaseInvoiceCreateDto
    {
        public long? PurchaseOrderId { get; set; }

        public int? PurchaseTypeId { get; set; }

        [Required]
        public DateTime InvoiceDate { get; set; }

        [Required]
        public int SupplierId { get; set; }

        // ⭐ ERP CORE → MUST BE LONG (BIGINT)
        [Required]
        public long WarehouseId { get; set; }

        [MaxLength(200)]
        public string? Reference { get; set; }

        public decimal? PrimaryTransport { get; set; }
        public decimal? SecondaryTransport { get; set; }
        public decimal? Discount { get; set; }

        public string? Status { get; set; }

        public string? Notes { get; set; }

        [Required]
        public List<PurchaseInvoiceItemDto> Items { get; set; }
            = new List<PurchaseInvoiceItemDto>();
    }
}