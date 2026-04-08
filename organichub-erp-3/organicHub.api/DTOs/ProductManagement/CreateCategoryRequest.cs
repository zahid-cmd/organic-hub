using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.ProductManagement
{
    public class CreateCategoryRequest
    {
        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = string.Empty;

        // Required → Category must belong to a Product Type
        [Required]
        public int ProductTypeId { get; set; }

        [MaxLength(20)]
        public string? Status { get; set; }

        [MaxLength(255)]
        public string? Remarks { get; set; }
    }
}
