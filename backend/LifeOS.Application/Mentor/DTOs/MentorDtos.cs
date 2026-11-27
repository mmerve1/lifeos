using System.ComponentModel.DataAnnotations;

namespace LifeOS.Application.Mentor.DTOs;

public record ProposedTaskActionDto(
    string Type,        // "create_task"
    string Title,
    string Category,
    string Priority,
    string? DueDate,
    string? DueTime
);

public record MentorMessageDto(
    Guid Id,
    Guid ConversationId,
    string Role,
    string Content,
    ProposedTaskActionDto? ProposedAction,
    string? ActionStatus,
    DateTime CreatedAt
);

public record MentorConversationDto(
    Guid Id,
    string Title,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record SendMentorMessageRequest(
    Guid? ConversationId,
    [Required, MinLength(1), MaxLength(2000)] string Message,
    string Language = "tr"
);

public record SendMentorMessageResponse(
    MentorConversationDto Conversation,
    MentorMessageDto UserMessage,
    MentorMessageDto AssistantMessage
);

public record ResolveActionRequest(
    bool Approve
);

public record MentorMemoryDto(
    Guid Id,
    string Content,
    string Category,
    DateTime CreatedAt
);

public record CreateMemoryRequest(
    [Required, MinLength(2), MaxLength(500)] string Content,
    [MaxLength(40)] string Category = "general"
);

public record MentorPermissionsDto(
    bool AllowCalendar,
    bool AllowTasks,
    bool AllowHabits,
    bool AllowCareer,
    bool AllowFinance,
    bool AllowHealth
);
