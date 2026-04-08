using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseTypeToPO : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PurchaseTypeId",
                table: "PurchaseOrders",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_PurchaseTypeId",
                table: "PurchaseOrders",
                column: "PurchaseTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseOrders_ProductTypes_PurchaseTypeId",
                table: "PurchaseOrders",
                column: "PurchaseTypeId",
                principalTable: "ProductTypes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseOrders_ProductTypes_PurchaseTypeId",
                table: "PurchaseOrders");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseOrders_PurchaseTypeId",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "PurchaseTypeId",
                table: "PurchaseOrders");
        }
    }
}
