using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.ProductManagement
{
    public class CreateSubCategoryRequest
    {
        [Required]
        public required string SubCategoryName { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public int? SortOrder { get; set; }

        [Required]
        public required string Status { get; set; }

        public string? Remarks { get; set; }
    }
}