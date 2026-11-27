using LifeOS.Application.Habits.DTOs;
using LifeOS.Infrastructure.Habits;
using LifeOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Tests;

public class HabitGoalServiceTests
{
    private static LifeOSDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<LifeOSDbContext>()
            .UseInMemoryDatabase($"LifeOSHabitsTest_{Guid.NewGuid()}")
            .Options;
        return new LifeOSDbContext(options);
    }

    [Fact]
    public async Task Habit_CreateToggleAndDelete_WorksWithUserIsolation()
    {
        await using var db = CreateInMemoryDb();
        var service = new HabitGoalService(db);
        var userA = Guid.NewGuid();
        var userB = Guid.NewGuid();
        var today = DateOnly.FromDateTime(DateTime.UtcNow).ToString("yyyy-MM-dd");

        var created = await service.CreateHabitAsync(userA, new CreateHabitRequest("Morning Walk", "health", 5));
        Assert.Equal("Morning Walk", created.Title);
        Assert.Empty(created.CompletedDates);

        // Toggle ON
        var checkedIn = await service.ToggleHabitDateAsync(userA, created.Id, today);
        Assert.Single(checkedIn.CompletedDates);
        Assert.Contains(today, checkedIn.CompletedDates);

        // Toggle OFF
        var uncheckedOut = await service.ToggleHabitDateAsync(userA, created.Id, today);
        Assert.Empty(uncheckedOut.CompletedDates);

        // Isolation
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.DeleteHabitAsync(userB, created.Id));

        await service.DeleteHabitAsync(userA, created.Id);
        Assert.Empty(await service.GetHabitsAsync(userA));
    }

    [Fact]
    public async Task Goal_CreateStepClampsAndDelete_Works()
    {
        await using var db = CreateInMemoryDb();
        var service = new HabitGoalService(db);
        var userId = Guid.NewGuid();

        var goal = await service.CreateGoalAsync(userId, new CreateGoalRequest("Read 2 Books", "Monthly reading", "learning", "monthly", 2));
        Assert.Equal(0, goal.CurrentCount);
        Assert.Equal(2, goal.TargetCount);

        var stepped = await service.StepGoalAsync(userId, goal.Id, 1);
        Assert.Equal(1, stepped.CurrentCount);

        // Should clamp at targetCount
        var clamped = await service.StepGoalAsync(userId, goal.Id, 5);
        Assert.Equal(2, clamped.CurrentCount);

        // Should clamp at 0
        var zeroed = await service.StepGoalAsync(userId, goal.Id, -10);
        Assert.Equal(0, zeroed.CurrentCount);

        await service.DeleteGoalAsync(userId, goal.Id);
        Assert.Empty(await service.GetGoalsAsync(userId));
    }
}
