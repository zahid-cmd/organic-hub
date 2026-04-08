namespace OrganicHub.Api.DTOs.GeneralSetup
{
    public class BranchCreateDto
    {
        public int CompanyId { get; set; }

        public string BranchName { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";

        public string? PrimaryPhone { get; set; }
        public string? SecondaryPhone { get; set; }
        public string? Email { get; set; }
        public string? Location { get; set; }
        public string? Address { get; set; }

        public string? Bin { get; set; }
        public string? VatPaymentCode { get; set; }
        public string? EconomicActivity { get; set; }
    }
}