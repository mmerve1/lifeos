using LifeOS.Application.Tasks.DTOs;
using LifeOS.Infrastructure.Persistence;
using LifeOS.Infrastructure.Tasks;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Tests;

public class TaskServiceTests
{
    private static LifeOSDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<LifeOSDbContext>()
            .UseInMemoryDatabase(databaseName: $"LifeOSTestDb_{Guid.NewGuid()}")
            .Options;
        return new LifeOSDbContext(options);
    }

    [Fact]
    public async Task CreateToggleUpdateDelete_LifecycleWorks()
    {
        await using var db = CreateInMemoryDb();
        var service = new TaskService(db);
        var userId = Guid.NewGuid();
        var today = DateOnly.FromDateTime(DateTime.UtcNow).ToString("yyyy-MM-dd");

        // Create
        var created = await service.CreateAsync(userId, new CreateTaskRequest(
            Title: "Prepare API",
            Description: "Build task CRUD endpoints",
            Priority: "high",
            Category: "career",
            DueDate: today,
            DueTime: "14:00"
        ));

        Assert.Equal("Prepare API", created.Title);
        Assert.Equal("high", created.Priority);
        Assert.Equal("active", created.Status);
        Assert.Equal("career", created.Category);

        // Toggle -> completed
        var toggled = await service.ToggleAsync(userId, created.Id);
        Assert.Equal("completed", toggled.Status);

        // Stats reflect today's task
        var stats = await service.GetTodayStatsAsync(userId);
        Assert.Equal(1, stats.Total);
        Assert.Equal(1, stats.Completed);
        Assert.Equal(0, stats.Active);

        // Update
        var updated = await service.UpdateAsync(userId, created.Id, new UpdateTaskRequest(
            Title: "Prepare API v2",
            Description: null,
            Priority: "low",
            Status: "deferred",
            Category: null,
            DueDate: null,
            DueTime: null
        ));
        Assert.Equal("Prepare API v2", updated.Title);
        Assert.Equal("low", updated.Priority);
        Assert.Equal("deferred", updated.Status);

        // Delete
        await service.DeleteAsync(userId, created.Id);
        var list = await service.GetAllAsync(userId);
        Assert.Empty(list);
    }

    [Fact]
    public async Task UserIsolation_PreventsReadingOrDeletingOtherUsersTasks()
    {
        await using var db = CreateInMemoryDb();
        var service = new TaskService(db);
        var userA = Guid.NewGuid();
        var userB = Guid.NewGuid();

        var taskA = await service.CreateAsync(userA, new CreateTaskRequest("Private Task", null));

        var userBTasks = await service.GetAllAsync(userB);
        Assert.Empty(userBTasks);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GetByIdAsync(userB, taskA.Id));
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.DeleteAsync(userB, taskA.Id));
    }
}
