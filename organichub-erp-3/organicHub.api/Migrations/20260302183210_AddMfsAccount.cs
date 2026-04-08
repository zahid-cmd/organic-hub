using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMfsAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MfsAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AccountCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AccountName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ShortAccountName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    WalletOrMerchantNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MfsLedgerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BranchId = table.Column<int>(type: "integer", nullable: false),
                    SubGroupId = table.Column<int>(type: "integer", nullable: false),
                    LinkedBankAccountId = table.Column<int>(type: "integer", nullable: true),
                    IsCollectionAccount = table.Column<bool>(type: "boolean", nullable: false),
                    IsPaymentAccount = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_MfsAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MfsAccounts_AccountSubGroups_SubGroupId",
                        column: x => x.SubGroupId,
                        principalTable: "AccountSubGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MfsAccounts_BankAccounts_LinkedBankAccountId",
                        column: x => x.LinkedBankAccountId,
                        principalTable: "BankAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MfsAccounts_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MfsAccounts_AccountCode",
                table: "MfsAccounts",
                column: "AccountCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MfsAccounts_BranchId",
                table: "MfsAccounts",
                column: "BranchId");

            migrationBuilder.CreateIndex(
                name: "IX_MfsAccounts_LinkedBankAccountId",
                table: "MfsAccounts",
                column: "LinkedBankAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_MfsAccounts_SubGroupId",
                table: "MfsAccounts",
                column: "SubGroupId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MfsAccounts");
        }
    }
}
