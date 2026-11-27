using LifeOS.Application.Tasks.DTOs;

namespace LifeOS.Application.Tasks.Interfaces;

public interface ITaskService
{
    Task<IReadOnlyList<TaskDto>> GetAllAsync(Guid userId, string? status = null, string? dueDate = null, CancellationToken cancellationToken = default);
    Task<TaskDto> GetByIdAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);
    Task<TaskDto> CreateAsync(Guid userId, CreateTaskRequest request, CancellationToken cancellationToken = default);
    Task<TaskDto> UpdateAsync(Guid userId, Guid taskId, UpdateTaskRequest request, CancellationToken cancellationToken = default);
    Task<TaskDto> ToggleAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid userId, Guid taskId, CancellationToken cancellationToken = default);
    Task<TaskStatsDto> GetTodayStatsAsync(Guid userId, CancellationToken cancellationToken = default);
}
