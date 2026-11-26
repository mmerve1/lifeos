using LifeOS.Domain.Common;
using LifeOS.Domain.Enums;

namespace LifeOS.Domain.Entities;

public class TaskItem : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskItemStatus Status { get; set; } = TaskItemStatus.Active;
    public ModuleCategory Category { get; set; } = ModuleCategory.Personal;
    public DateOnly? DueDate { get; set; }
    public string? DueTime { get; set; }
}
