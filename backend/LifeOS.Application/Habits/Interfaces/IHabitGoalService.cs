using LifeOS.Application.Habits.DTOs;

namespace LifeOS.Application.Habits.Interfaces;

public interface IHabitGoalService
{
    Task<IReadOnlyList<HabitDto>> GetHabitsAsync(Guid userId, CancellationToken ct = default);
    Task<HabitDto> CreateHabitAsync(Guid userId, CreateHabitRequest request, CancellationToken ct = default);
    Task<HabitDto> ToggleHabitDateAsync(Guid userId, Guid habitId, string dateIso, CancellationToken ct = default);
    Task DeleteHabitAsync(Guid userId, Guid habitId, CancellationToken ct = default);

    Task<IReadOnlyList<GoalDto>> GetGoalsAsync(Guid userId, CancellationToken ct = default);
    Task<GoalDto> CreateGoalAsync(Guid userId, CreateGoalRequest request, CancellationToken ct = default);
    Task<GoalDto> StepGoalAsync(Guid userId, Guid goalId, int delta, CancellationToken ct = default);
    Task DeleteGoalAsync(Guid userId, Guid goalId, CancellationToken ct = default);
}
