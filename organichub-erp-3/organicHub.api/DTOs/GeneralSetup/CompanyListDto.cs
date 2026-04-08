namespace OrganicHub.Api.DTOs.GeneralSetup
{
    public class CompanyListDto
    {
        public long Id { get; set; }   // ⭐ FIXED

        public string CompanyCode { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? Bin { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}