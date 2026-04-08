using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCardChargesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CardCharges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PosLedgerId = table.Column<int>(type: "integer", nullable: false),
                    CardSetupId = table.Column<int>(type: "integer", nullable: false),
                    ChargePercent = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    Remarks = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardCharges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CardCharges_CardSetups_CardSetupId",
                        column: x => x.CardSetupId,
                        principalTable: "CardSetups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CardCharges_PosAccounts_PosLedgerId",
                        column: x => x.PosLedgerId,
                        principalTable: "PosAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CardCharges_CardSetupId",
                table: "CardCharges",
                column: "CardSetupId");

            migrationBuilder.CreateIndex(
                name: "IX_CardCharges_PosLedgerId",
                table: "CardCharges",
                column: "PosLedgerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CardCharges");
        }
    }
}
