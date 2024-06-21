using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class terddedu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_AspNetUsers_PurchaserId",
                table: "Tickets");

            migrationBuilder.RenameColumn(
                name: "PurchaserId",
                table: "Tickets",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Tickets_PurchaserId",
                table: "Tickets",
                newName: "IX_Tickets_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_AspNetUsers_UserId",
                table: "Tickets",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_AspNetUsers_UserId",
                table: "Tickets");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Tickets",
                newName: "PurchaserId");

            migrationBuilder.RenameIndex(
                name: "IX_Tickets_UserId",
                table: "Tickets",
                newName: "IX_Tickets_PurchaserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_AspNetUsers_PurchaserId",
                table: "Tickets",
                column: "PurchaserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
