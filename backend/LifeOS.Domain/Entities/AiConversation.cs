using LifeOS.Domain.Common;

namespace LifeOS.Domain.Entities;

public class AiConversation : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;

    public ICollection<AiMessage> Messages { get; set; } = new List<AiMessage>();
}
