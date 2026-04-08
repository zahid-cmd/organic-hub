namespace OrganicHub.Api.DTOs.GeneralSetup
{
    public class CreateConfigurationSettingDto
    {
        public string Module { get; set; } = null!;
        public string ConfigurationName { get; set; } = null!;
        public bool IsEnabled { get; set; }
        public string? Remarks { get; set; }
    }
}