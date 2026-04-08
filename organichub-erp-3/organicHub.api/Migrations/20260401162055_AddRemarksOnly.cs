using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRemarksOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryBatchTransactions_Products_ProductId",
                table: "InventoryBatchTransactions");

            migrationBuilder.AlterColumn<long>(
                name: "ProductId",
                table: "InventoryBatchTransactions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                table: "InventoryBatchTransactions",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryBatchTransactions_Products_ProductId",
                table: "InventoryBatchTransactions",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryBatchTransactions_Products_ProductId",
                table: "InventoryBatchTransactions");

            migrationBuilder.DropColumn(
                name: "Remarks",
                table: "InventoryBatchTransactions");

            migrationBuilder.AlterColumn<long>(
                name: "ProductId",
                table: "InventoryBatchTransactions",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryBatchTransactions_Products_ProductId",
                table: "InventoryBatchTransactions",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id");
        }
    }
}
