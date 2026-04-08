using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRemarksToProductSalePrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                table: "ProductSalePrices",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Remarks",
                table: "ProductSalePrices");
        }
    }
}
