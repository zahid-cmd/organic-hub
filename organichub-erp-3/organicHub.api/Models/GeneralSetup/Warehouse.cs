using System;

namespace OrganicHub.Api.Models.GeneralSetup
{
    public class Warehouse
    {
        // =========================================
        // PRIMARY KEY ⭐ ERP RULE → MUST BE LONG
        // =========================================
        public long Id { get; set; }

        // =========================================
        // RELATION : COMPANY
        // =========================================
        public long CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        // =========================================
        // RELATION : BRANCH
        // =========================================
        public long BranchId { get; set; }
        public Branch Branch { get; set; } = null!;

        // =========================================
        // BASIC INFO
        // =========================================
        public string WarehouseCode { get; set; } = string.Empty;
        public string WarehouseName { get; set; } = string.Empty;

        public bool IsDefault { get; set; } = false;
        public string Status { get; set; } = "Active";

        // =========================================
        // SYSTEM
        // =========================================
        public bool IsDeleted { get; set; } = false;

        public string CreatedBy { get; set; } = "System";
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}