using System;

namespace OrganicHub.Api.Models.GeneralSetup
{
    public class ConfigurationSetting
    {
        public long Id { get; set; }

        public string Module { get; set; } = null!;
        public string ConfigurationCode { get; set; } = null!;
        public string ConfigurationName { get; set; } = null!;
        public bool IsEnabled { get; set; }
        public string? Remarks { get; set; }

        public bool IsDeleted { get; set; } = false;

        public string CreatedBy { get; set; } = "System";
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}