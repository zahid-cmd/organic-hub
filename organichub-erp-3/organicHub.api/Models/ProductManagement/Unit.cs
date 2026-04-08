using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using OrganicHub.Api.Models.ProductManagement;

namespace OrganicHub.Api.Models.ProductManagement
{
    public class Unit
    {
        // =============================
        // PRIMARY KEY
        // =============================
        [Key]
        public int Id { get; set; }

        // =============================
        // BASIC INFO
        // =============================
        [Required]
        [MaxLength(50)]
        public string UnitCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string UnitName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Status { get; set; } = "Active";

        [MaxLength(255)]
        public string? Remarks { get; set; }

        // =============================
        // NAVIGATION
        // =============================
        // One Unit → Many Products
        public ICollection<Product> Products { get; set; } = new List<Product>();

        // =============================
        // AUDIT
        // =============================
        [MaxLength(100)]
        public string CreatedBy { get; set; } = "System";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}