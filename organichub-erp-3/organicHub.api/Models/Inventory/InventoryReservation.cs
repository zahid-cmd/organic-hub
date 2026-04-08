using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrganicHub.Api.Models.Inventory
{
    public class InventoryReservation
    {
        [Key]
        public long ReservationId { get; set; }

        [Required]
        public long SalesOrderId { get; set; }

        [MaxLength(50)]
        public string? SalesOrderNo { get; set; }

        [Required]
        public long ProductId { get; set; }

        [Required]
        public long WarehouseId { get; set; }

        [Required]
        public long BatchId { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QtyReserved { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QtyIssued { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QtyBalanceReserved { get; set; }

        public InventoryReservationStatus ReservationStatus { get; set; }

        public DateTime ReservedAt { get; set; }

        public DateTime? ReleasedAt { get; set; }

        public DateTime CreatedAt { get; set; }

        [MaxLength(50)]
        public string? CreatedBy { get; set; }

        public bool IsDeleted { get; set; }
    }
}