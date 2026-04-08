using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProductSalePrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "ProductSalePrices");

            migrationBuilder.DropColumn(
                name: "NewPrice",
                table: "ProductSalePrices");

            migrationBuilder.DropColumn(
                name: "OldPrice",
                table: "ProductSalePrices");

            migrationBuilder.DropColumn(
                name: "Remarks",
                table: "ProductSalePrices");

            migrationBuilder.RenameColumn(
                name: "UpdatedDate",
                table: "ProductSalePrices",
                newName: "UpdatedAt");

            migrationBuilder.AlterColumn<string>(
                name: "UpdatedBy",
                table: "ProductSalePrices",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "ProductSalePrices",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "ProductSalePrices",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "ProductSalePrices",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "ProductSalePrices",
                type: "numeric(18,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_ProductSalePrices_CreatedAt",
                table: "ProductSalePrices",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ProductSalePrices_ProductId",
                table: "ProductSalePrices",
                column: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductSalePrices_CreatedAt",
                table: "ProductSalePrices");

            migrationBuilder.DropIndex(
                name: "IX_ProductSalePrices_ProductId",
                table: "ProductSalePrices");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "ProductSalePrices");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "ProductSalePrices");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "ProductSalePrices",
                newName: "UpdatedDate");

            migrationBuilder.AlterColumn<string>(
                name: "UpdatedBy",
                table: "ProductSalePrices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreatedBy",
                table: "ProductSalePrices",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "ProductSalePrices",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "ProductSalePrices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "NewPrice",
                table: "ProductSalePrices",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OldPrice",
                table: "ProductSalePrices",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                table: "ProductSalePrices",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);
        }
    }
}
