using System;
using System.Collections.Generic;

namespace OrganicHub.Api.DTOs.Purchase
{
    public class PurchaseOrderDetailsDto
    {
        public long Id { get; set; }

        public string OrderNo { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; }

        public int SupplierId { get; set; }

        public int? PurchaseTypeId { get; set; }     // ⭐ VERY IMPORTANT (NEW)

        public string? SupplierName { get; set; }
        public string? SupplierPhone { get; set; }
        public string? SupplierAddress { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = "Draft";

        public string? Notes { get; set; }

        public List<PurchaseOrderItemDto> Items { get; set; }
            = new();
    }
}