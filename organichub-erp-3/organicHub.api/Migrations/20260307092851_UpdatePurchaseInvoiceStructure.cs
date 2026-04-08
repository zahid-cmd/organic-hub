using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePurchaseInvoiceStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "PurchaseInvoices",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "PurchaseInvoices",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PrimaryTransport",
                table: "PurchaseInvoices",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<long>(
                name: "PurchaseOrderId",
                table: "PurchaseInvoices",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PurchaseType",
                table: "PurchaseInvoices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reference",
                table: "PurchaseInvoices",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SecondaryTransport",
                table: "PurchaseInvoices",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discount",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "PrimaryTransport",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "PurchaseOrderId",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "PurchaseType",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "Reference",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "SecondaryTransport",
                table: "PurchaseInvoices");
        }
    }
}
