using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LifeOS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLifeProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "user_life_profiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LifeStage = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    FocusAreas = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    PrimaryGoal = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PeakTime = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    MentorStyle = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    OnboardingCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_life_profiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_life_profiles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_user_life_profiles_UserId",
                table: "user_life_profiles",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_life_profiles");
        }
    }
}
