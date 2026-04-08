namespace OrganicHub.Api.DTOs.GeneralSetup
{
    public class WarehouseListDto
    {
        public int Id { get; set; }

        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;

        public string CompanyName { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;

        public bool IsDefault { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}