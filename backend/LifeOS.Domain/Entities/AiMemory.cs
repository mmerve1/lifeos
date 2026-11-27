using LifeOS.Domain.Common;

namespace LifeOS.Domain.Entities;

public class AiMemory : BaseEntity
{
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = "general";
}
