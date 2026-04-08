using System;

namespace OrganicHub.Api.DTOs
{
    public class ProductResponse
    {
        public int Id { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string? SKU { get; set; }
        public string? Barcode { get; set; }
        public string ProductName { get; set; } = string.Empty;

        public int ProductTypeId { get; set; }
        public string? ProductTypeName { get; set; }

        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }

        public int SubCategoryId { get; set; }
        public string? SubCategoryName { get; set; }

        public int UnitId { get; set; }
        public string? UnitName { get; set; }

        public string Status { get; set; } = "Active";
        public string? Remarks { get; set; }

        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }

        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
