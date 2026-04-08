using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.Models.ClientManagement
{
    public class SupplierRequest
    {
        [Required]
        public string SupplierName { get; set; } = string.Empty;

        public string? AccountSubGroupName { get; set; }
        public string? SubGroupCode { get; set; }

        public string? ContactPerson { get; set; }

        public string? PrimaryPhone { get; set; }
        public string? Phone { get; set; }

        public string? Email { get; set; }
        public string? Address { get; set; }

        public string Status { get; set; } = "Active";
        public string? Remarks { get; set; }
    }
}
