using LifeOS.Domain.Common;

namespace LifeOS.Domain.Entities;

public class AiUserPreference : BaseEntity
{
    public Guid UserId { get; set; }
    public bool AllowCalendar { get; set; } = true;
    public bool AllowTasks { get; set; } = true;
    public bool AllowHabits { get; set; } = true;
    public bool AllowCareer { get; set; } = true;
    public bool AllowFinance { get; set; } = false;
    public bool AllowHealth { get; set; } = false;
}
