using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class ProductLedgerMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CogsLedgerId",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InventoryLedgerId",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_CogsLedgerId",
                table: "Products",
                column: "CogsLedgerId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_InventoryLedgerId",
                table: "Products",
                column: "InventoryLedgerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_GeneralLedgers_CogsLedgerId",
                table: "Products",
                column: "CogsLedgerId",
                principalTable: "GeneralLedgers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_GeneralLedgers_InventoryLedgerId",
                table: "Products",
                column: "InventoryLedgerId",
                principalTable: "GeneralLedgers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_GeneralLedgers_CogsLedgerId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_GeneralLedgers_InventoryLedgerId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_CogsLedgerId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_InventoryLedgerId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "CogsLedgerId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "InventoryLedgerId",
                table: "Products");
        }
    }
}
