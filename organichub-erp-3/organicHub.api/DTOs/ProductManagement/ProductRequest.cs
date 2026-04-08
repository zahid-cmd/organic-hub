using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.ProductManagement
{
    public class ProductRequest
    {
        [Required]
        public string ProductName { get; set; } = string.Empty;

        public string? SKU { get; set; }
        public string? Barcode { get; set; }

        [Required]
        public int ProductTypeId { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public int SubCategoryId { get; set; }

        [Required]
        public int UnitId { get; set; }

        public string Status { get; set; } = "Active";
        public string? Remarks { get; set; }
    }
}
