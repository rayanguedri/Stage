using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class testttuyu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "StripeSessions",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StripeSessions_UserId",
                table: "StripeSessions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_StripeSessions_AspNetUsers_UserId",
                table: "StripeSessions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StripeSessions_AspNetUsers_UserId",
                table: "StripeSessions");

            migrationBuilder.DropIndex(
                name: "IX_StripeSessions_UserId",
                table: "StripeSessions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "StripeSessions");
        }
    }
}
