using System.Text.Json;
using LifeOS.Application.Mentor.DTOs;
using LifeOS.Application.Mentor.Interfaces;
using LifeOS.Application.Tasks.DTOs;
using LifeOS.Application.Tasks.Interfaces;
using LifeOS.Domain.Entities;
using LifeOS.Domain.Enums;
using LifeOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Infrastructure.Mentor;

public class AIMentorService : IAIMentorService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly LifeOSDbContext _db;
    private readonly IAIProvider _aiProvider;
    private readonly ITaskService _taskService;

    public AIMentorService(
        LifeOSDbContext db,
        IAIProvider aiProvider,
        ITaskService taskService)
    {
        _db = db;
        _aiProvider = aiProvider;
        _taskService = taskService;
    }

    public async Task<IReadOnlyList<MentorConversationDto>> GetConversationsAsync(Guid userId, CancellationToken ct = default)
    {
        var items = await _db.AiConversations
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.UpdatedAt)
            .ToListAsync(ct);

        return items.Select(ToConversationDto).ToList();
    }

    public async Task<IReadOnlyList<MentorMessageDto>> GetMessagesAsync(Guid userId, Guid conversationId, CancellationToken ct = default)
    {
        var ownsConversation = await _db.AiConversations
            .AsNoTracking()
            .AnyAsync(c => c.Id == conversationId && c.UserId == userId, ct);

        if (!ownsConversation)
            throw new KeyNotFoundException("Conversation not found.");

        var messages = await _db.AiMessages
            .AsNoTracking()
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync(ct);

        return messages.Select(ToMessageDto).ToList();
    }

    public async Task<SendMentorMessageResponse> SendMessageAsync(
        Guid userId,
        SendMentorMessageRequest request,
        CancellationToken ct = default)
    {
        AiConversation conversation;
        if (request.ConversationId.HasValue)
        {
            conversation = await _db.AiConversations
                .FirstOrDefaultAsync(c => c.Id == request.ConversationId.Value && c.UserId == userId, ct)
                ?? throw new KeyNotFoundException("Conversation not found.");
        }
        else
        {
            var title = request.Message.Trim();
            if (title.Length > 50) title = title[..50] + "…";
            conversation = new AiConversation
            {
                UserId = userId,
                Title = title,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _db.AiConversations.Add(conversation);
        }

        var userMsg = new AiMessage
        {
            ConversationId = conversation.Id,
            Role = "user",
            Content = request.Message.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.AiMessages.Add(userMsg);

        // Build selective context respecting AiUserPreferences
        var context = await BuildContextSnapshotAsync(userId, ct);
        var reply = await _aiProvider.GenerateReplyAsync(request.Message, request.Language, context, ct);

        var assistantMsg = new AiMessage
        {
            ConversationId = conversation.Id,
            Role = "assistant",
            Content = reply.Content,
            ProposedActionJson = reply.ProposedAction is not null
                ? JsonSerializer.Serialize(reply.ProposedAction, JsonOptions)
                : null,
            ActionStatus = reply.ProposedAction is not null ? "pending" : null,
            CreatedAt = DateTime.UtcNow.AddMilliseconds(10),
            UpdatedAt = DateTime.UtcNow.AddMilliseconds(10),
        };
        _db.AiMessages.Add(assistantMsg);

        conversation.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return new SendMentorMessageResponse(
            ToConversationDto(conversation),
            ToMessageDto(userMsg),
            ToMessageDto(assistantMsg)
        );
    }

    public async Task<MentorMessageDto> ResolveActionAsync(
        Guid userId,
        Guid messageId,
        bool approve,
        CancellationToken ct = default)
    {
        var message = await _db.AiMessages
            .Include(m => m.Conversation)
            .FirstOrDefaultAsync(m => m.Id == messageId && m.Conversation.UserId == userId, ct)
            ?? throw new KeyNotFoundException("Message not found.");

        if (string.IsNullOrWhiteSpace(message.ProposedActionJson) || message.ActionStatus != "pending")
        {
            return ToMessageDto(message);
        }

        if (approve)
        {
            var action = JsonSerializer.Deserialize<ProposedTaskActionDto>(message.ProposedActionJson, JsonOptions);
            if (action is not null && action.Type == "create_task")
            {
                await _taskService.CreateAsync(userId, new CreateTaskRequest(
                    Title: action.Title,
                    Description: "AI Mentor önerisiyle eklendi",
                    Priority: action.Priority,
                    Category: action.Category,
                    DueDate: action.DueDate,
                    DueTime: action.DueTime
                ), ct);
            }
            message.ActionStatus = "approved";
        }
        else
        {
            message.ActionStatus = "rejected";
        }

        message.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return ToMessageDto(message);
    }

    public async Task<IReadOnlyList<MentorMemoryDto>> GetMemoriesAsync(Guid userId, CancellationToken ct = default)
    {
        var items = await _db.AiMemories
            .AsNoTracking()
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(ct);

        return items.Select(m => new MentorMemoryDto(m.Id, m.Content, m.Category, m.CreatedAt)).ToList();
    }

    public async Task<MentorMemoryDto> AddMemoryAsync(Guid userId, CreateMemoryRequest request, CancellationToken ct = default)
    {
        var memory = new AiMemory
        {
            UserId = userId,
            Content = request.Content.Trim(),
            Category = string.IsNullOrWhiteSpace(request.Category) ? "general" : request.Category.Trim().ToLowerInvariant(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.AiMemories.Add(memory);
        await _db.SaveChangesAsync(ct);

        return new MentorMemoryDto(memory.Id, memory.Content, memory.Category, memory.CreatedAt);
    }

    public async Task DeleteMemoryAsync(Guid userId, Guid memoryId, CancellationToken ct = default)
    {
        var memory = await _db.AiMemories
            .FirstOrDefaultAsync(m => m.Id == memoryId && m.UserId == userId, ct)
            ?? throw new KeyNotFoundException("Memory not found.");

        _db.AiMemories.Remove(memory);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<MentorPermissionsDto> GetPermissionsAsync(Guid userId, CancellationToken ct = default)
    {
        var pref = await _db.AiUserPreferences
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);

        if (pref is null)
            return new MentorPermissionsDto(true, true, true, true, false, false);

        return ToPermissionsDto(pref);
    }

    public async Task<MentorPermissionsDto> UpdatePermissionsAsync(Guid userId, MentorPermissionsDto request, CancellationToken ct = default)
    {
        var pref = await _db.AiUserPreferences.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (pref is null)
        {
            pref = new AiUserPreference
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
            };
            _db.AiUserPreferences.Add(pref);
        }

        pref.AllowCalendar = request.AllowCalendar;
        pref.AllowTasks = request.AllowTasks;
        pref.AllowHabits = request.AllowHabits;
        pref.AllowCareer = request.AllowCareer;
        pref.AllowFinance = request.AllowFinance;
        pref.AllowHealth = request.AllowHealth;
        pref.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToPermissionsDto(pref);
    }

    private async Task<MentorContextSnapshot> BuildContextSnapshotAsync(Guid userId, CancellationToken ct)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
        var profile = await _db.UserLifeProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, ct);
        var permissions = await GetPermissionsAsync(userId, ct);

        var activeTasks = 0;
        var completedTasks = 0;
        if (permissions.AllowTasks)
        {
            var statuses = await _db.Tasks.AsNoTracking()
                .Where(t => t.UserId == userId)
                .Select(t => t.Status)
                .ToListAsync(ct);
            activeTasks = statuses.Count(s => s == TaskItemStatus.Active);
            completedTasks = statuses.Count(s => s == TaskItemStatus.Completed);
        }

        var habitCount = 0;
        var goalCount = 0;
        if (permissions.AllowHabits)
        {
            habitCount = await _db.Habits.AsNoTracking().CountAsync(h => h.UserId == userId, ct);
            goalCount = await _db.Goals.AsNoTracking().CountAsync(g => g.UserId == userId, ct);
        }

        var memories = await _db.AiMemories.AsNoTracking()
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(10)
            .Select(m => m.Content)
            .ToListAsync(ct);

        var focusAreas = string.IsNullOrWhiteSpace(profile?.FocusAreas)
            ? Array.Empty<string>()
            : profile!.FocusAreas.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return new MentorContextSnapshot(
            UserName: user?.FullName ?? "Merve",
            LifeStage: profile?.LifeStage,
            PrimaryGoal: profile?.PrimaryGoal,
            FocusAreas: focusAreas,
            PeakTime: profile?.PeakTime ?? "morning",
            MentorStyle: profile?.MentorStyle ?? "supportive",
            ActiveTaskCount: activeTasks,
            CompletedTaskCount: completedTasks,
            HabitCount: habitCount,
            GoalCount: goalCount,
            Memories: memories,
            Permissions: permissions
        );
    }

    private static MentorConversationDto ToConversationDto(AiConversation c) =>
        new(c.Id, c.Title, c.CreatedAt, c.UpdatedAt);

    private static MentorMessageDto ToMessageDto(AiMessage m) => new(
        Id: m.Id,
        ConversationId: m.ConversationId,
        Role: m.Role,
        Content: m.Content,
        ProposedAction: string.IsNullOrWhiteSpace(m.ProposedActionJson)
            ? null
            : JsonSerializer.Deserialize<ProposedTaskActionDto>(m.ProposedActionJson, JsonOptions),
        ActionStatus: m.ActionStatus,
        CreatedAt: m.CreatedAt
    );

    private static MentorPermissionsDto ToPermissionsDto(AiUserPreference p) => new(
        p.AllowCalendar,
        p.AllowTasks,
        p.AllowHabits,
        p.AllowCareer,
        p.AllowFinance,
        p.AllowHealth
    );
}
