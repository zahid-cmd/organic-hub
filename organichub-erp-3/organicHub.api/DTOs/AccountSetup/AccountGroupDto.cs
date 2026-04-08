namespace OrganicHub.Api.DTOs.AccountSetup
{
    public class AccountGroupDto
    {
        public int Id { get; set; }
        public string GroupCode { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;

        public int AccountClassId { get; set; }
        public string AccountClassName { get; set; } = string.Empty;
        public string ClassCode { get; set; } = string.Empty;
        public string ClassMode { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
        public string? Remarks { get; set; }

        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }

        public string UpdatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedDate { get; set; }
    }
}