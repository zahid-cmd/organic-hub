using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class SimplifiedBatch_ProductNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryBatches_Products_ProductId",
                table: "InventoryBatches");

            migrationBuilder.AlterColumn<string>(
                name: "SourceNo",
                table: "InventoryBatchTransactions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "InventoryBatchTransactions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<long>(
                name: "SourceId",
                table: "InventoryBatchTransactions",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "TransactionType",
                table: "InventoryBatchTransactions",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<long>(
                name: "ProductId",
                table: "InventoryBatches",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryBatchTransactions_BatchId",
                table: "InventoryBatchTransactions",
                column: "BatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryBatches_Products_ProductId",
                table: "InventoryBatches",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryBatchTransactions_InventoryBatches_BatchId",
                table: "InventoryBatchTransactions",
                column: "BatchId",
                principalTable: "InventoryBatches",
                principalColumn: "BatchId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryBatches_Products_ProductId",
                table: "InventoryBatches");

            migrationBuilder.DropForeignKey(
                name: "FK_InventoryBatchTransactions_InventoryBatches_BatchId",
                table: "InventoryBatchTransactions");

            migrationBuilder.DropIndex(
                name: "IX_InventoryBatchTransactions_BatchId",
                table: "InventoryBatchTransactions");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "InventoryBatchTransactions");

            migrationBuilder.DropColumn(
                name: "SourceId",
                table: "InventoryBatchTransactions");

            migrationBuilder.DropColumn(
                name: "TransactionType",
                table: "InventoryBatchTransactions");

            migrationBuilder.AlterColumn<string>(
                name: "SourceNo",
                table: "InventoryBatchTransactions",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<long>(
                name: "ProductId",
                table: "InventoryBatches",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryBatches_Products_ProductId",
                table: "InventoryBatches",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
