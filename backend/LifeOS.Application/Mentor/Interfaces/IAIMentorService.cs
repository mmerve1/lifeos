using LifeOS.Application.Mentor.DTOs;

namespace LifeOS.Application.Mentor.Interfaces;

public interface IAIMentorService
{
    Task<IReadOnlyList<MentorConversationDto>> GetConversationsAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<MentorMessageDto>> GetMessagesAsync(Guid userId, Guid conversationId, CancellationToken ct = default);
    Task<SendMentorMessageResponse> SendMessageAsync(Guid userId, SendMentorMessageRequest request, CancellationToken ct = default);
    Task<MentorMessageDto> ResolveActionAsync(Guid userId, Guid messageId, bool approve, CancellationToken ct = default);

    Task<IReadOnlyList<MentorMemoryDto>> GetMemoriesAsync(Guid userId, CancellationToken ct = default);
    Task<MentorMemoryDto> AddMemoryAsync(Guid userId, CreateMemoryRequest request, CancellationToken ct = default);
    Task DeleteMemoryAsync(Guid userId, Guid memoryId, CancellationToken ct = default);

    Task<MentorPermissionsDto> GetPermissionsAsync(Guid userId, CancellationToken ct = default);
    Task<MentorPermissionsDto> UpdatePermissionsAsync(Guid userId, MentorPermissionsDto request, CancellationToken ct = default);
}
