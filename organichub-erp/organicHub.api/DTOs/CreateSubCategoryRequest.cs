using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs
{
    public class CreateSubCategoryRequest
    {
        [Required]
        public string SubCategoryName { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public int? SortOrder { get; set; }

        public string Status { get; set; }

        public string Remarks { get; set; }
    }
}
