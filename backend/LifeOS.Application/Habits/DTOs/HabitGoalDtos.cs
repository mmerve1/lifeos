using System.ComponentModel.DataAnnotations;

namespace LifeOS.Application.Habits.DTOs;

public record HabitDto(
    Guid Id,
    string Title,
    string Category,
    int TargetPerWeek,
    IReadOnlyList<string> CompletedDates,
    DateTime CreatedAt
);

public record CreateHabitRequest(
    [Required, MinLength(1), MaxLength(200)] string Title,
    string Category = "health",
    [Range(1, 7)] int TargetPerWeek = 5
);

public record ToggleHabitDateRequest(
    [Required] string Date // YYYY-MM-DD
);

public record GoalDto(
    Guid Id,
    string Title,
    string? Description,
    string Category,
    string Period,
    int CurrentCount,
    int TargetCount,
    string? Deadline,
    DateTime CreatedAt
);

public record CreateGoalRequest(
    [Required, MinLength(1), MaxLength(200)] string Title,
    [MaxLength(2000)] string? Description,
    string Category = "personal",
    string Period = "weekly",
    [Range(1, 10000)] int TargetCount = 5,
    string? Deadline = null
);

public record StepGoalRequest(
    int Delta
);
