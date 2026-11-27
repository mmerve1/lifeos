using System.Security.Claims;
using LifeOS.Application.Common.Models;
using LifeOS.Application.Profile.DTOs;
using LifeOS.Application.Profile.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LifeOS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly ILifeProfileService _service;

    public ProfileController(ILifeProfileService service)
    {
        _service = service;
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            throw new UnauthorizedAccessException("Invalid user claim.");
        return userId;
    }

    [HttpGet("life")]
    public async Task<IActionResult> GetLifeProfile(CancellationToken ct)
    {
        var profile = await _service.GetAsync(GetUserId(), ct);
        return Ok(ApiResponse<LifeProfileDto?>.Ok(profile));
    }

    [HttpPut("onboarding")]
    public async Task<IActionResult> SaveOnboarding([FromBody] SaveOnboardingRequest request, CancellationToken ct)
    {
        var saved = await _service.SaveOnboardingAsync(GetUserId(), request, ct);
        return Ok(ApiResponse<LifeProfileDto>.Ok(saved, "Life profile saved."));
    }
}
