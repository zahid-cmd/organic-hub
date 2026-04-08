namespace OrganicHub.Api.DTOs.GeneralSetup
{
    public class WarehouseCreateDto
    {
        public int CompanyId { get; set; }
        public int BranchId { get; set; }

        public string WarehouseName { get; set; } = string.Empty;

        public bool IsDefault { get; set; } = false;
        public string? Status { get; set; }
    }
}