namespace OrganicHub.Api.DTOs.AccountSetup
{
    public class CreateCashAccountDto
    {
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public int BranchId { get; set; }
        public bool IsCollectionAccount { get; set; }
        public bool IsPaymentAccount { get; set; }
        public string Status { get; set; } = "Active";
        public string? Remarks { get; set; }
    }
}