using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs
{
    public class CreateProductTypeRequest
    {
        [Required]
        [MaxLength(100)]
        public string TypeName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Status { get; set; }

        [MaxLength(255)]
        public string? Remarks { get; set; }

        // ✅ Business Behaviour Only
        public bool IsPurchasable { get; set; }
        public bool IsSellable { get; set; }
        public bool IsProductionItem { get; set; }
    }
}
