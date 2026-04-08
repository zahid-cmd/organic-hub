using System;

namespace OrganicHub.Api.DTOs.Purchase
{
    public class PurchaseInvoiceItemDto
    {
        public long ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string? WarehouseName { get; set; }
        
        public decimal CommercialQty { get; set; }

        public decimal NormalLossPercent { get; set; }

        public decimal Quantity { get; set; }

        public decimal CommercialRate { get; set; }

        public decimal Rate { get; set; }

        public decimal Amount { get; set; }
    }
}