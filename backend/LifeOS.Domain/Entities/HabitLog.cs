using LifeOS.Domain.Common;

namespace LifeOS.Domain.Entities;

public class HabitLog : BaseEntity
{
    public Guid HabitId { get; set; }
    public DateOnly CompletedDate { get; set; }

    public HabitItem Habit { get; set; } = null!;
}
