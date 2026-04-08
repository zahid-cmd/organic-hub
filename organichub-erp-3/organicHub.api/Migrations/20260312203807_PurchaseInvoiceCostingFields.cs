using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class PurchaseInvoiceCostingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CommercialQty",
                table: "PurchaseInvoiceItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CommercialRate",
                table: "PurchaseInvoiceItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "NormalLossPercent",
                table: "PurchaseInvoiceItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommercialQty",
                table: "PurchaseInvoiceItems");

            migrationBuilder.DropColumn(
                name: "CommercialRate",
                table: "PurchaseInvoiceItems");

            migrationBuilder.DropColumn(
                name: "NormalLossPercent",
                table: "PurchaseInvoiceItems");
        }
    }
}
