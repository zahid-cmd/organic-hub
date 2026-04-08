using System;

namespace OrganicHub.Api.DTOs.ProductManagement
{
    public class ProductResponse
    {
        public long Id { get; set; }

        public string ProductCode { get; set; } = string.Empty;
        public string? SKU { get; set; }
        public string? Barcode { get; set; }
        public string ProductName { get; set; } = string.Empty;

        public long ProductTypeId { get; set; }
        public string? ProductTypeName { get; set; }

        public long CategoryId { get; set; }
        public string? CategoryName { get; set; }

        public long SubCategoryId { get; set; }
        public string? SubCategoryName { get; set; }

        public long UnitId { get; set; }
        public string? UnitName { get; set; }

        public string Status { get; set; } = "Active";
        public string? Remarks { get; set; }

        // 🔥 NEW FIELD FOR SHELF IMAGE
        public string? PrimaryImageUrl { get; set; }

        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }

        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}