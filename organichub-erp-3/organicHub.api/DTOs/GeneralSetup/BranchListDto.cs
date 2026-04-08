namespace OrganicHub.Api.DTOs.GeneralSetup
{
    public class BranchListDto
    {
        public long Id { get; set; }          // ⭐ FIXED
        public long CompanyId { get; set; }   // ⭐ FIXED

        public string BranchCode { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;

        public string? Email { get; set; }
        public string? PrimaryPhone { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}