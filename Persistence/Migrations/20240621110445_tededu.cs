﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Persistence.Migrations
{
    /// <inheritdoc />
    public partial class tededu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PurchaserId",
                table: "Tickets",
                type: "text",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_PurchaserId",
                table: "Tickets",
                column: "PurchaserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_AspNetUsers_PurchaserId",
                table: "Tickets",
                column: "PurchaserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_AspNetUsers_PurchaserId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_PurchaserId",
                table: "Tickets");

            migrationBuilder.AlterColumn<Guid>(
                name: "PurchaserId",
                table: "Tickets",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
