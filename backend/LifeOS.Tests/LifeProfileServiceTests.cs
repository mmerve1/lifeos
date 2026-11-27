using LifeOS.Application.Profile.DTOs;
using LifeOS.Infrastructure.Persistence;
using LifeOS.Infrastructure.Profile;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Tests;

public class LifeProfileServiceTests
{
    private static LifeOSDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<LifeOSDbContext>()
            .UseInMemoryDatabase($"LifeOSProfileTest_{Guid.NewGuid()}")
            .Options;
        return new LifeOSDbContext(options);
    }

    [Fact]
    public async Task SaveOnboarding_CreatesAndUpdatesProfilePerUser()
    {
        await using var db = CreateInMemoryDb();
        var service = new LifeProfileService(db);
        var userId = Guid.NewGuid();

        Assert.Null(await service.GetAsync(userId));

        var created = await service.SaveOnboardingAsync(userId, new SaveOnboardingRequest(
            LifeStage: "student",
            FocusAreas: new[] { "academic", "career", "health" },
            PrimaryGoal: "Mezun olmadan iyi bir staj bulmak",
            PeakTime: "morning",
            MentorStyle: "supportive"
        ));

        Assert.True(created.OnboardingCompleted);
        Assert.Equal("student", created.LifeStage);
        Assert.Equal(3, created.FocusAreas.Count);

        var updated = await service.SaveOnboardingAsync(userId, new SaveOnboardingRequest(
            LifeStage: "working",
            FocusAreas: new[] { "career", "finance" },
            PrimaryGoal: "Kariyerde terfi ve tasarruf",
            PeakTime: "evening",
            MentorStyle: "direct"
        ));

        Assert.Equal(created.Id, updated.Id);
        Assert.Equal("working", updated.LifeStage);
        Assert.Equal(2, updated.FocusAreas.Count);
        Assert.Equal("direct", updated.MentorStyle);
    }
}
