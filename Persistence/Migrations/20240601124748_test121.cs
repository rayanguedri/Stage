using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class test121 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuantityAvailable",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "QuantitySold",
                table: "Tickets");

            migrationBuilder.AddColumn<string>(
                name: "PaymentIntentId",
                table: "Tickets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentIntentId",
                table: "Activities",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentIntentId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "PaymentIntentId",
                table: "Activities");

            migrationBuilder.AddColumn<int>(
                name: "QuantityAvailable",
                table: "Tickets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "QuantitySold",
                table: "Tickets",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
