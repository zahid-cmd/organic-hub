using System;
using System.Collections.Generic;

namespace OrganicHub.Api.Models.GeneralSetup
{
    public class Branch
    {
        // =============================
        // PRIMARY KEY ⭐ ERP RULE
        // =============================
        public long Id { get; set; }

        // =============================
        // RELATION : COMPANY
        // =============================
        public long CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        // =============================
        // BASIC INFO
        // =============================
        public string BranchCode { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";

        // =============================
        // CONTACT
        // =============================
        public string? PrimaryPhone { get; set; }
        public string? SecondaryPhone { get; set; }
        public string? Email { get; set; }
        public string? Location { get; set; }
        public string? Address { get; set; }

        // =============================
        // VAT
        // =============================
        public string? Bin { get; set; }
        public string? VatPaymentCode { get; set; }
        public string? EconomicActivity { get; set; }

        // =============================
        // RELATION : WAREHOUSES
        // =============================
        public ICollection<Warehouse> Warehouses { get; set; } = new List<Warehouse>();

        // =============================
        // SYSTEM
        // =============================
        public bool IsDeleted { get; set; } = false;

        public string CreatedBy { get; set; } = "System";
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}