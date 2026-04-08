namespace OrganicHub.Api.DTOs.AccountSetup
{
    public class AccountClassCreateDto
    {
        public string ClassName { get; set; } = string.Empty;
        public string ClassMode { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public string? Remarks { get; set; }
    }
}