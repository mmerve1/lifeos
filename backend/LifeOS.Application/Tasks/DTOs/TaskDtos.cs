using System.ComponentModel.DataAnnotations;

namespace LifeOS.Application.Tasks.DTOs;

public record TaskDto(
    Guid Id,
    string Title,
    string? Description,
    string Priority,
    string Status,
    string Category,
    string? DueDate,
    string? DueTime,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateTaskRequest(
    [Required, MinLength(1), MaxLength(200)] string Title,
    [MaxLength(2000)] string? Description,
    string Priority = "medium",
    string Category = "personal",
    string? DueDate = null,
    [MaxLength(10)] string? DueTime = null
);

public record UpdateTaskRequest(
    [MinLength(1), MaxLength(200)] string? Title,
    [MaxLength(2000)] string? Description,
    string? Priority,
    string? Status,
    string? Category,
    string? DueDate,
    [MaxLength(10)] string? DueTime
);

public record TaskStatsDto(
    int Total,
    int Completed,
    int Active,
    int Deferred
);
