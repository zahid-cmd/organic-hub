using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class InventoryBatchEngineIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_InventoryReservations_SalesOrderId_ProductId_BatchId",
                table: "InventoryReservations");

            migrationBuilder.AlterColumn<int>(
                name: "WarehouseId",
                table: "InventoryReservations",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<int>(
                name: "WarehouseId",
                table: "InventoryBatches",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitCost",
                table: "InventoryBatches",
                type: "numeric(18,6)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,4)");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_BatchId_ReservationStatus",
                table: "InventoryReservations",
                columns: new[] { "BatchId", "ReservationStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_ProductId_WarehouseId_ReservationStat~",
                table: "InventoryReservations",
                columns: new[] { "ProductId", "WarehouseId", "ReservationStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_SalesOrderId_ProductId",
                table: "InventoryReservations",
                columns: new[] { "SalesOrderId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryBatches_ProductId_WarehouseId_QtyBalance",
                table: "InventoryBatches",
                columns: new[] { "ProductId", "WarehouseId", "QtyBalance" });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryBatches_SourceType_SourceId",
                table: "InventoryBatches",
                columns: new[] { "SourceType", "SourceId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_InventoryReservations_BatchId_ReservationStatus",
                table: "InventoryReservations");

            migrationBuilder.DropIndex(
                name: "IX_InventoryReservations_ProductId_WarehouseId_ReservationStat~",
                table: "InventoryReservations");

            migrationBuilder.DropIndex(
                name: "IX_InventoryReservations_SalesOrderId_ProductId",
                table: "InventoryReservations");

            migrationBuilder.DropIndex(
                name: "IX_InventoryBatches_ProductId_WarehouseId_QtyBalance",
                table: "InventoryBatches");

            migrationBuilder.DropIndex(
                name: "IX_InventoryBatches_SourceType_SourceId",
                table: "InventoryBatches");

            migrationBuilder.AlterColumn<long>(
                name: "WarehouseId",
                table: "InventoryReservations",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<long>(
                name: "WarehouseId",
                table: "InventoryBatches",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<decimal>(
                name: "UnitCost",
                table: "InventoryBatches",
                type: "numeric(18,4)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,6)");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryReservations_SalesOrderId_ProductId_BatchId",
                table: "InventoryReservations",
                columns: new[] { "SalesOrderId", "ProductId", "BatchId" });
        }
    }
}
