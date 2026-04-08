using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.ClientManagement
{
    public class SupplierCreateDto
    {
        // ==============================
        // BASIC INFORMATION
        // ==============================
        [Required]
        [MaxLength(150)]
        public string SupplierName { get; set; } = string.Empty;

        // ==============================
        // CONTACT INFORMATION
        // ==============================
        [MaxLength(150)]
        public string? ContactPerson { get; set; }

        [MaxLength(50)]
        public string? PrimaryPhone { get; set; }

        [MaxLength(50)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        // ==============================
        // STATUS & CONTROL
        // ==============================
        [MaxLength(20)]
        public string? Status { get; set; }

        [MaxLength(500)]
        public string? Remarks { get; set; }
    }
}