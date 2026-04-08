using System;
using System.Collections.Generic;

namespace OrganicHub.Api.DTOs.Purchase
{
    public class PurchaseOrderCreateDto
    {
        public DateTime OrderDate { get; set; }

        public int SupplierId { get; set; }

        public int? PurchaseTypeId { get; set; }   // ⭐ NEW

        public string? Status { get; set; }

        public string? Notes { get; set; }

        public List<PurchaseOrderItemDto> Items { get; set; }
            = new List<PurchaseOrderItemDto>();
    }
}