using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class Add_Product_To_BatchTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.AddColumn<long>(
               // name: "ProductId",
                //table: "InventoryBatchTransactions",
                //type: "bigint",
                //nullable: false,
                //defaultValue: 0L);

            //migrationBuilder.CreateIndex(
               // name: "IX_InventoryBatchTransactions_ProductId",
                //table: "InventoryBatchTransactions",
                //column: "ProductId");

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
            //migrationBuilder.DropForeignKey(
               // name: "FK_InventoryBatchTransactions_Products_ProductId",
               // table: "InventoryBatchTransactions");

            //migrationBuilder.DropIndex(
               // name: "IX_InventoryBatchTransactions_ProductId",
               // table: "InventoryBatchTransactions");

           //migrationBuilder.DropColumn(
                //name: "ProductId",
                //table: "InventoryBatchTransactions");
        }
    }
}
