using System.Security.Claims;
using LifeOS.Application.Common.Models;
using LifeOS.Application.Mentor.DTOs;
using LifeOS.Application.Mentor.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LifeOS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MentorController : ControllerBase
{
    private readonly IAIMentorService _mentorService;

    public MentorController(IAIMentorService mentorService)
    {
        _mentorService = mentorService;
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            throw new UnauthorizedAccessException("Invalid user claim.");
        return userId;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(CancellationToken ct)
    {
        var list = await _mentorService.GetConversationsAsync(GetUserId(), ct);
        return Ok(ApiResponse<IReadOnlyList<MentorConversationDto>>.Ok(list));
    }

    [HttpGet("conversations/{id:guid}/messages")]
    public async Task<IActionResult> GetMessages(Guid id, CancellationToken ct)
    {
        var list = await _mentorService.GetMessagesAsync(GetUserId(), id, ct);
        return Ok(ApiResponse<IReadOnlyList<MentorMessageDto>>.Ok(list));
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] SendMentorMessageRequest request, CancellationToken ct)
    {
        var result = await _mentorService.SendMessageAsync(GetUserId(), request, ct);
        return Ok(ApiResponse<SendMentorMessageResponse>.Ok(result));
    }

    [HttpPost("messages/{messageId:guid}/action")]
    public async Task<IActionResult> ResolveAction(Guid messageId, [FromBody] ResolveActionRequest request, CancellationToken ct)
    {
        var updated = await _mentorService.ResolveActionAsync(GetUserId(), messageId, request.Approve, ct);
        return Ok(ApiResponse<MentorMessageDto>.Ok(updated));
    }

    [HttpGet("memories")]
    public async Task<IActionResult> GetMemories(CancellationToken ct)
    {
        var list = await _mentorService.GetMemoriesAsync(GetUserId(), ct);
        return Ok(ApiResponse<IReadOnlyList<MentorMemoryDto>>.Ok(list));
    }

    [HttpPost("memories")]
    public async Task<IActionResult> AddMemory([FromBody] CreateMemoryRequest request, CancellationToken ct)
    {
        var created = await _mentorService.AddMemoryAsync(GetUserId(), request, ct);
        return Ok(ApiResponse<MentorMemoryDto>.Ok(created, "Memory saved."));
    }

    [HttpDelete("memories/{id:guid}")]
    public async Task<IActionResult> DeleteMemory(Guid id, CancellationToken ct)
    {
        await _mentorService.DeleteMemoryAsync(GetUserId(), id, ct);
        return Ok(ApiResponse<object>.Ok(new { deleted = true }, "Memory deleted."));
    }

    [HttpGet("permissions")]
    public async Task<IActionResult> GetPermissions(CancellationToken ct)
    {
        var perms = await _mentorService.GetPermissionsAsync(GetUserId(), ct);
        return Ok(ApiResponse<MentorPermissionsDto>.Ok(perms));
    }

    [HttpPut("permissions")]
    public async Task<IActionResult> UpdatePermissions([FromBody] MentorPermissionsDto request, CancellationToken ct)
    {
        var updated = await _mentorService.UpdatePermissionsAsync(GetUserId(), request, ct);
        return Ok(ApiResponse<MentorPermissionsDto>.Ok(updated, "Permissions updated."));
    }
}
