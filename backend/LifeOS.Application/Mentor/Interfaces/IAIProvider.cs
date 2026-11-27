using LifeOS.Application.Mentor.DTOs;

namespace LifeOS.Application.Mentor.Interfaces;

public record MentorContextSnapshot(
    string UserName,
    string? LifeStage,
    string? PrimaryGoal,
    IReadOnlyList<string> FocusAreas,
    string PeakTime,
    string MentorStyle,
    int ActiveTaskCount,
    int CompletedTaskCount,
    int HabitCount,
    int GoalCount,
    IReadOnlyList<string> Memories,
    MentorPermissionsDto Permissions
);

public record AIProviderReply(
    string Content,
    ProposedTaskActionDto? ProposedAction = null
);

public interface IAIProvider
{
    Task<AIProviderReply> GenerateReplyAsync(
        string userMessage,
        string language,
        MentorContextSnapshot context,
        CancellationToken ct = default);
}
