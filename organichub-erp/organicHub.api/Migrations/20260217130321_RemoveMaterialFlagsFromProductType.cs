using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMaterialFlagsFromProductType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFinishedProduct",
                table: "ProductTypes");

            migrationBuilder.DropColumn(
                name: "IsPackingMaterial",
                table: "ProductTypes");

            migrationBuilder.DropColumn(
                name: "IsRawMaterial",
                table: "ProductTypes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFinishedProduct",
                table: "ProductTypes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPackingMaterial",
                table: "ProductTypes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsRawMaterial",
                table: "ProductTypes",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
