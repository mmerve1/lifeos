using LifeOS.Application.Habits.DTOs;
using LifeOS.Application.Habits.Interfaces;
using LifeOS.Domain.Entities;
using LifeOS.Domain.Enums;
using LifeOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Infrastructure.Habits;

public class HabitGoalService : IHabitGoalService
{
    private readonly LifeOSDbContext _db;

    public HabitGoalService(LifeOSDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<HabitDto>> GetHabitsAsync(Guid userId, CancellationToken ct = default)
    {
        var items = await _db.Habits
            .AsNoTracking()
            .Include(h => h.Logs)
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync(ct);

        return items.Select(ToHabitDto).ToList();
    }

    public async Task<HabitDto> CreateHabitAsync(Guid userId, CreateHabitRequest request, CancellationToken ct = default)
    {
        var entity = new HabitItem
        {
            UserId = userId,
            Title = request.Title.Trim(),
            Category = ParseEnum(request.Category, ModuleCategory.Health),
            TargetPerWeek = Math.Clamp(request.TargetPerWeek, 1, 7),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Habits.Add(entity);
        await _db.SaveChangesAsync(ct);

        return ToHabitDto(entity);
    }

    public async Task<HabitDto> ToggleHabitDateAsync(Guid userId, Guid habitId, string dateIso, CancellationToken ct = default)
    {
        if (!DateOnly.TryParse(dateIso?.Trim(), out var parsedDate))
            throw new ArgumentException("Invalid date format. Expected YYYY-MM-DD.");

        var habit = await _db.Habits
            .Include(h => h.Logs)
            .FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId, ct)
            ?? throw new KeyNotFoundException("Habit not found.");

        var existingLog = habit.Logs.FirstOrDefault(l => l.CompletedDate == parsedDate);
        if (existingLog is not null)
        {
            _db.HabitLogs.Remove(existingLog);
        }
        else
        {
            var newLog = new HabitLog
            {
                HabitId = habit.Id,
                CompletedDate = parsedDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _db.HabitLogs.Add(newLog);
        }

        habit.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return ToHabitDto(habit);
    }

    public async Task DeleteHabitAsync(Guid userId, Guid habitId, CancellationToken ct = default)
    {
        var habit = await _db.Habits
            .FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId, ct)
            ?? throw new KeyNotFoundException("Habit not found.");

        _db.Habits.Remove(habit);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<GoalDto>> GetGoalsAsync(Guid userId, CancellationToken ct = default)
    {
        var items = await _db.Goals
            .AsNoTracking()
            .Where(g => g.UserId == userId)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync(ct);

        return items.Select(ToGoalDto).ToList();
    }

    public async Task<GoalDto> CreateGoalAsync(Guid userId, CreateGoalRequest request, CancellationToken ct = default)
    {
        DateOnly? deadline = null;
        if (!string.IsNullOrWhiteSpace(request.Deadline))
        {
            if (!DateOnly.TryParse(request.Deadline.Trim(), out var parsed))
                throw new ArgumentException("Invalid deadline format. Expected YYYY-MM-DD.");
            deadline = parsed;
        }

        var entity = new GoalItem
        {
            UserId = userId,
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Category = ParseEnum(request.Category, ModuleCategory.Personal),
            Period = ParseEnum(request.Period, GoalPeriod.Weekly),
            CurrentCount = 0,
            TargetCount = Math.Max(1, request.TargetCount),
            Deadline = deadline,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Goals.Add(entity);
        await _db.SaveChangesAsync(ct);

        return ToGoalDto(entity);
    }

    public async Task<GoalDto> StepGoalAsync(Guid userId, Guid goalId, int delta, CancellationToken ct = default)
    {
        var goal = await _db.Goals
            .FirstOrDefaultAsync(g => g.Id == goalId && g.UserId == userId, ct)
            ?? throw new KeyNotFoundException("Goal not found.");

        goal.CurrentCount = Math.Clamp(goal.CurrentCount + delta, 0, goal.TargetCount);
        goal.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return ToGoalDto(goal);
    }

    public async Task DeleteGoalAsync(Guid userId, Guid goalId, CancellationToken ct = default)
    {
        var goal = await _db.Goals
            .FirstOrDefaultAsync(g => g.Id == goalId && g.UserId == userId, ct)
            ?? throw new KeyNotFoundException("Goal not found.");

        _db.Goals.Remove(goal);
        await _db.SaveChangesAsync(ct);
    }

    private static TEnum ParseEnum<TEnum>(string? value, TEnum fallback) where TEnum : struct, Enum
    {
        if (!string.IsNullOrWhiteSpace(value) && Enum.TryParse<TEnum>(value.Trim(), ignoreCase: true, out var parsed))
            return parsed;
        return fallback;
    }

    private static HabitDto ToHabitDto(HabitItem h) => new(
        Id: h.Id,
        Title: h.Title,
        Category: h.Category.ToString().ToLowerInvariant(),
        TargetPerWeek: h.TargetPerWeek,
        CompletedDates: h.Logs
            .Select(l => l.CompletedDate.ToString("yyyy-MM-dd"))
            .OrderByDescending(d => d)
            .ToList(),
        CreatedAt: h.CreatedAt
    );

    private static GoalDto ToGoalDto(GoalItem g) => new(
        Id: g.Id,
        Title: g.Title,
        Description: g.Description,
        Category: g.Category.ToString().ToLowerInvariant(),
        Period: g.Period.ToString().ToLowerInvariant(),
        CurrentCount: g.CurrentCount,
        TargetCount: g.TargetCount,
        Deadline: g.Deadline?.ToString("yyyy-MM-dd"),
        CreatedAt: g.CreatedAt
    );
}
