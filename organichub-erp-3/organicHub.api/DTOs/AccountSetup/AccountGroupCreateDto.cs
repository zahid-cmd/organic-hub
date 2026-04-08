using System.ComponentModel.DataAnnotations;

namespace OrganicHub.Api.DTOs.AccountSetup
{
    public class AccountGroupCreateDto
    {
        [Required]
        public string GroupName { get; set; } = string.Empty;

        [Required]
        public int AccountClassId { get; set; }

        [Required]
        public string Status { get; set; } = "Active";

        public string? Remarks { get; set; }
    }
}