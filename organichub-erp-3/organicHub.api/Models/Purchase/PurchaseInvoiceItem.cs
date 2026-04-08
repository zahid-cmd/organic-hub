using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using OrganicHub.Api.Models.ProductManagement;

namespace OrganicHub.Api.Models.Purchase
{
    public class PurchaseInvoiceItem
    {
        [Key]
        public long Id { get; set; }

        public long PurchaseInvoiceId { get; set; }

        public long ProductId { get; set; }

        /* ================= ERP COSTING ================= */

        public decimal CommercialQty { get; set; }

        public decimal NormalLossPercent { get; set; }

        public decimal Quantity { get; set; }      // Net Qty

        public decimal CommercialRate { get; set; }

        public decimal Rate { get; set; }          // Effective Rate

        public decimal Amount { get; set; }

        /* ================= NAVIGATION ================= */

        [ForeignKey("PurchaseInvoiceId")]
        public PurchaseInvoice PurchaseInvoice { get; set; } = null!;

        [ForeignKey("ProductId")]
        public Product Product { get; set; } = null!;
    }
}