using LifeOS.Domain.Common;

namespace LifeOS.Domain.Entities;

public class AiMessage : BaseEntity
{
    public Guid ConversationId { get; set; }
    public string Role { get; set; } = "user"; // "user" | "assistant"
    public string Content { get; set; } = string.Empty;
    public string? ProposedActionJson { get; set; }
    public string? ActionStatus { get; set; } // null | "pending" | "approved" | "rejected"

    public AiConversation Conversation { get; set; } = null!;
}
