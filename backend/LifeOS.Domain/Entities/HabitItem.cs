using LifeOS.Domain.Common;
using LifeOS.Domain.Enums;

namespace LifeOS.Domain.Entities;

public class HabitItem : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public ModuleCategory Category { get; set; } = ModuleCategory.Health;
    public int TargetPerWeek { get; set; } = 5;

    public ICollection<HabitLog> Logs { get; set; } = new List<HabitLog>();
}
