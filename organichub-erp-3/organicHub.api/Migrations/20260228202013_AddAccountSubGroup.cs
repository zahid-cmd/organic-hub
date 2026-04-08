using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountSubGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AccountGroups_AccountClasses_AccountClassId",
                table: "AccountGroups");

            migrationBuilder.CreateTable(
                name: "AccountSubGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubGroupCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SubGroupName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    GroupId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Remarks = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountSubGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AccountSubGroups_AccountGroups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "AccountGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountGroups_GroupCode",
                table: "AccountGroups",
                column: "GroupCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AccountSubGroups_GroupId",
                table: "AccountSubGroups",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountSubGroups_SubGroupCode",
                table: "AccountSubGroups",
                column: "SubGroupCode",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AccountGroups_AccountClasses_AccountClassId",
                table: "AccountGroups",
                column: "AccountClassId",
                principalTable: "AccountClasses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AccountGroups_AccountClasses_AccountClassId",
                table: "AccountGroups");

            migrationBuilder.DropTable(
                name: "AccountSubGroups");

            migrationBuilder.DropIndex(
                name: "IX_AccountGroups_GroupCode",
                table: "AccountGroups");

            migrationBuilder.AddForeignKey(
                name: "FK_AccountGroups_AccountClasses_AccountClassId",
                table: "AccountGroups",
                column: "AccountClassId",
                principalTable: "AccountClasses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
