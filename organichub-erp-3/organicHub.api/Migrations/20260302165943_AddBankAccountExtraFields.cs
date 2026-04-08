using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrganicHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBankAccountExtraFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BankId",
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
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BankId",
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
        }
    }
}
