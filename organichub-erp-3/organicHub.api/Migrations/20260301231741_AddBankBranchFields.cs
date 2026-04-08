using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBankBranchFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BankAccounts_BankAccountName_BranchId",
                table: "BankAccounts");

            migrationBuilder.DropColumn(
                name: "BankSetupId",
                table: "BankAccounts");

            migrationBuilder.DropColumn(
                name: "FullAccountNumber",
                table: "BankAccounts");

            migrationBuilder.DropColumn(
                name: "FullAccountTitle",
                table: "BankAccounts");

            migrationBuilder.DropColumn(
                name: "ShortAccountNumber",
                table: "BankAccounts");

            migrationBuilder.DropColumn(
                name: "ShortAccountTitle",
                table: "BankAccounts");

            migrationBuilder.DropColumn(
                name: "ShortBankName",
                table: "BankAccounts");

            migrationBuilder.AlterColumn<string>(
                name: "BankBranchName",
                table: "BankAccounts",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccountName",
                table: "BankAccounts",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountName",
                table: "BankAccounts");

            migrationBuilder.AlterColumn<string>(
                name: "BankBranchName",
                table: "BankAccounts",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AddColumn<int>(
                name: "BankSetupId",
                table: "BankAccounts",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullAccountNumber",
                table: "BankAccounts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullAccountTitle",
                table: "BankAccounts",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortAccountNumber",
                table: "BankAccounts",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortAccountTitle",
                table: "BankAccounts",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortBankName",
                table: "BankAccounts",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_BankAccountName_BranchId",
                table: "BankAccounts",
                columns: new[] { "BankAccountName", "BranchId" },
                unique: true);
        }
    }
}
