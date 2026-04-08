namespace OrganicHub.Api.DTOs.GeneralSetup
{
    public class CompanyCreateDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public string? Remarks { get; set; }

        public string? PrimaryPhone { get; set; }
        public string? SecondaryPhone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }

        public string? Tin { get; set; }
        public string? Bin { get; set; }
        public string? VatPaymentCode { get; set; }
        public string? OwnershipType { get; set; }
    }
}