using System;
using System.Collections.Generic;

namespace OrganicHub.Api.Models.GeneralSetup
{
    public class Company
    {
        // =========================================
        // PRIMARY KEY ⭐ ERP RULE
        // =========================================
        public long Id { get; set; }

        // =========================================
        // BASIC INFO
        // =========================================
        public string CompanyCode { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public string? Remarks { get; set; }

        // =========================================
        // CONTACT
        // =========================================
        public string? PrimaryPhone { get; set; }
        public string? SecondaryPhone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }

        // =========================================
        // TAX
        // =========================================
        public string? Tin { get; set; }
        public string? Bin { get; set; }
        public string? VatPaymentCode { get; set; }
        public string? OwnershipType { get; set; }

        // =========================================
        // LOGO
        // =========================================
        public string? LogoFileName { get; set; }

        // =========================================
        // RELATIONSHIPS
        // =========================================
        public ICollection<Branch> Branches { get; set; } = new List<Branch>();
        public ICollection<Warehouse> Warehouses { get; set; } = new List<Warehouse>();

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