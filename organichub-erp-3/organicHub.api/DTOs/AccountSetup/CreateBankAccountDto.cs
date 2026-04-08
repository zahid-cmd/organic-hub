namespace OrganicHub.Api.DTOs.AccountSetup
{
    public class CreateBankAccountDto
    {
        public string AccountCode { get; set; } = string.Empty;

        public string AccountName { get; set; } = string.Empty;

        public string BankAccountName { get; set; } = string.Empty;

        public int BranchId { get; set; }

        // ================= BANK RELATION =================
        // Angular uses bankSetupId → keep same name

        public int? BankSetupId { get; set; }

        // ================= ACCOUNT DETAILS =================

        public string? FullAccountTitle { get; set; }
        public string? ShortAccountTitle { get; set; }
        public string? FullAccountNumber { get; set; }
        public string? ShortAccountNumber { get; set; }
        public string? ShortBankName { get; set; }

        // ================= BANK BRANCH =================

        public string BankBranchName { get; set; } = string.Empty;
        public string? BankShortBranchName { get; set; }

        // ================= FLAGS =================

        public bool IsCollectionAccount { get; set; }
        public bool IsPaymentAccount { get; set; }

        public string Status { get; set; } = "Active";
        public string? Remarks { get; set; }
    }
}