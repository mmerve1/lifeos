using LifeOS.Application.Tasks.DTOs;
using LifeOS.Application.Tasks.Interfaces;
using LifeOS.Domain.Entities;
using LifeOS.Domain.Enums;
using LifeOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Infrastructure.Tasks;

public class TaskService : ITaskService
{
    private readonly LifeOSDbContext _db;

    public TaskService(LifeOSDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<TaskDto>> GetAllAsync(
        Guid userId,
        string? status = null,
        string? dueDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Tasks.AsNoTracking().Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<TaskItemStatus>(status, ignoreCase: true, out var parsedStatus))
        {
            query = query.Where(t => t.Status == parsedStatus);
        }

        if (!string.IsNullOrWhiteSpace(dueDate) &&
            DateOnly.TryParse(dueDate, out var parsedDate))
        {
            query = query.Where(t => t.DueDate == parsedDate);
        }

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return items.Select(ToDto).ToList();
    }

    public async Task<TaskDto> GetByIdAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Tasks.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Task not found.");

        return ToDto(entity);
    }

    public async Task<TaskDto> CreateAsync(Guid userId, CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new TaskItem
        {
            UserId = userId,
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Priority = ParseEnum(request.Priority, TaskPriority.Medium),
            Status = TaskItemStatus.Active,
            Category = ParseEnum(request.Category, ModuleCategory.Personal),
            DueDate = ParseDueDate(request.DueDate),
            DueTime = string.IsNullOrWhiteSpace(request.DueTime) ? null : request.DueTime.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Tasks.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(entity);
    }

    public async Task<TaskDto> UpdateAsync(Guid userId, Guid taskId, UpdateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Task not found.");

        if (!string.IsNullOrWhiteSpace(request.Title))
            entity.Title = request.Title.Trim();

        if (request.Description is not null)
            entity.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();

        if (!string.IsNullOrWhiteSpace(request.Priority))
            entity.Priority = ParseEnum(request.Priority, entity.Priority);

        if (!string.IsNullOrWhiteSpace(request.Status))
            entity.Status = ParseEnum(request.Status, entity.Status);

        if (!string.IsNullOrWhiteSpace(request.Category))
            entity.Category = ParseEnum(request.Category, entity.Category);

        if (request.DueDate is not null)
            entity.DueDate = ParseDueDate(request.DueDate);

        if (request.DueTime is not null)
            entity.DueTime = string.IsNullOrWhiteSpace(request.DueTime) ? null : request.DueTime.Trim();

        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return ToDto(entity);
    }

    public async Task<TaskDto> ToggleAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Task not found.");

        entity.Status = entity.Status == TaskItemStatus.Completed
            ? TaskItemStatus.Active
            : TaskItemStatus.Completed;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken);
        return ToDto(entity);
    }

    public async Task DeleteAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default)
    {
        var entity = await _db.Tasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId, cancellationToken)
            ?? throw new KeyNotFoundException("Task not found.");

        _db.Tasks.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<TaskStatsDto> GetTodayStatsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var todayTasks = await _db.Tasks.AsNoTracking()
            .Where(t => t.UserId == userId && t.DueDate == today)
            .Select(t => t.Status)
            .ToListAsync(cancellationToken);

        return new TaskStatsDto(
            Total: todayTasks.Count,
            Completed: todayTasks.Count(s => s == TaskItemStatus.Completed),
            Active: todayTasks.Count(s => s == TaskItemStatus.Active),
            Deferred: todayTasks.Count(s => s == TaskItemStatus.Deferred)
        );
    }

    private static TEnum ParseEnum<TEnum>(string? value, TEnum fallback) where TEnum : struct, Enum
    {
        if (!string.IsNullOrWhiteSpace(value) && Enum.TryParse<TEnum>(value.Trim(), ignoreCase: true, out var parsed))
            return parsed;
        return fallback;
    }

    private static DateOnly? ParseDueDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;
        if (DateOnly.TryParse(value.Trim(), out var parsed))
            return parsed;
        throw new ArgumentException("Invalid dueDate format. Expected YYYY-MM-DD.");
    }

    private static TaskDto ToDto(TaskItem t) => new(
        Id: t.Id,
        Title: t.Title,
        Description: t.Description,
        Priority: t.Priority.ToString().ToLowerInvariant(),
        Status: t.Status.ToString().ToLowerInvariant(),
        Category: t.Category.ToString().ToLowerInvariant(),
        DueDate: t.DueDate?.ToString("yyyy-MM-dd"),
        DueTime: t.DueTime,
        CreatedAt: t.CreatedAt,
        UpdatedAt: t.UpdatedAt
    );
}
