namespace OrganicHub.Api.DTOs.AccountSetup
{
    public class CreateBankSetupDto
    {
        public string BankName { get; set; } = string.Empty;
        public string ShortName { get; set; } = string.Empty;
        public string? RoutingNumber { get; set; }
        public string? SwiftCode { get; set; }
        public string Status { get; set; } = "Active";
    }
}