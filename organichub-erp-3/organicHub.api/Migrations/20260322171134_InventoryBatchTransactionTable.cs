using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class InventoryBatchTransactionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InventoryBatchTransactions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BatchId = table.Column<long>(type: "bigint", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SourceNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    QtyIn = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    QtyOut = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    RunningBalance = table.Column<decimal>(type: "numeric(18,4)", nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(18,4)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryBatchTransactions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryBatches_WarehouseId",
                table: "InventoryBatches",
                column: "WarehouseId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryBatches_Products_ProductId",
                table: "InventoryBatches",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryBatches_Warehouses_WarehouseId",
                table: "InventoryBatches",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryBatches_Products_ProductId",
                table: "InventoryBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryBatches_Warehouses_WarehouseId",
                table: "InventoryBatches");

            migrationBuilder.DropTable(
                name: "InventoryBatchTransactions");

            migrationBuilder.DropIndex(
                name: "IX_InventoryBatches_WarehouseId",
                table: "InventoryBatches");
        }
    }
}
