using LifeOS.Application.Mentor.DTOs;
using LifeOS.Infrastructure.Mentor;
using LifeOS.Infrastructure.Persistence;
using LifeOS.Infrastructure.Tasks;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Tests;

public class AIMentorServiceTests
{
    private static LifeOSDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<LifeOSDbContext>()
            .UseInMemoryDatabase($"LifeOSMentorTest_{Guid.NewGuid()}")
            .Options;
        return new LifeOSDbContext(options);
    }

    [Fact]
    public async Task Chat_WithTaskIntent_ProposesActionAndCreatesTaskOnApproval()
    {
        await using var db = CreateInMemoryDb();
        var taskService = new TaskService(db);
        var mentorService = new AIMentorService(db, new SmartRuleBasedAIProvider(), taskService);
        var userId = Guid.NewGuid();

        var chatRes = await mentorService.SendMessageAsync(userId, new SendMentorMessageRequest(
            ConversationId: null,
            Message: "Yarın 10:00 İngilizce çalışmak için görev oluştur",
            Language: "tr"
        ));

        Assert.NotNull(chatRes.AssistantMessage.ProposedAction);
        Assert.Equal("pending", chatRes.AssistantMessage.ActionStatus);
        Assert.Equal("learning", chatRes.AssistantMessage.ProposedAction!.Category);

        // Before approval -> 0 tasks in DB
        Assert.Empty(await taskService.GetAllAsync(userId));

        // Approve action -> creates real task!
        var resolved = await mentorService.ResolveActionAsync(userId, chatRes.AssistantMessage.Id, approve: true);
        Assert.Equal("approved", resolved.ActionStatus);

        var tasks = await taskService.GetAllAsync(userId);
        Assert.Single(tasks);
        Assert.Equal("10:00", tasks[0].DueTime);
    }

    [Fact]
    public async Task MemoriesAndPermissions_CrudWorks()
    {
        await using var db = CreateInMemoryDb();
        var mentorService = new AIMentorService(db, new SmartRuleBasedAIProvider(), new TaskService(db));
        var userId = Guid.NewGuid();

        var mem = await mentorService.AddMemoryAsync(userId, new CreateMemoryRequest("Akşamları daha verimli çalışıyorum", "routine"));
        Assert.Single(await mentorService.GetMemoriesAsync(userId));

        await mentorService.DeleteMemoryAsync(userId, mem.Id);
        Assert.Empty(await mentorService.GetMemoriesAsync(userId));

        var updatedPerms = await mentorService.UpdatePermissionsAsync(userId, new MentorPermissionsDto(true, true, false, true, true, false));
        Assert.False(updatedPerms.AllowHabits);
        Assert.True(updatedPerms.AllowFinance);
    }
}
