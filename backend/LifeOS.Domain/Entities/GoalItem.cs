using LifeOS.Domain.Common;
using LifeOS.Domain.Enums;

namespace LifeOS.Domain.Entities;

public class GoalItem : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ModuleCategory Category { get; set; } = ModuleCategory.Personal;
    public GoalPeriod Period { get; set; } = GoalPeriod.Weekly;
    public int CurrentCount { get; set; } = 0;
    public int TargetCount { get; set; } = 1;
    public DateOnly? Deadline { get; set; }
}
