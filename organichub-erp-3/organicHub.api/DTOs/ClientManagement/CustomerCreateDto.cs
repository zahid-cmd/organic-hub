using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.ClientManagement
{
    public class CustomerCreateDto
    {
        // ==============================
        // REQUIRED
        // ==============================

        [Required(ErrorMessage = "Customer Name is required.")]
        [MaxLength(150)]
        public string CustomerName { get; set; } = string.Empty;


        // ==============================
        // CONTACT INFORMATION
        // ==============================

        [MaxLength(50)]
        public string? PrimaryPhone { get; set; }

        [MaxLength(50)]
        public string? SecondaryPhone { get; set; }

        [MaxLength(150)]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string? Email { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        [MaxLength(500)]
        public string? Remarks { get; set; }


        // ==============================
        // STATUS
        // ==============================

        [MaxLength(20)]
        public string? Status { get; set; } = "Active";
    }
}