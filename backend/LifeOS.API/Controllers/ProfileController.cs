using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using LifeOS.Application.Common.Models;
using LifeOS.Application.Profile.DTOs;
using LifeOS.Application.Profile.Interfaces;
using LifeOS.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LifeOS.API.Controllers;

public record UpdateAccountRequest(
    [Required, MinLength(2), MaxLength(150)] string FullName
);

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly ILifeProfileService _service;
    private readonly UserManager<ApplicationUser> _userManager;

    public ProfileController(
        ILifeProfileService service,
        UserManager<ApplicationUser> userManager)
    {
        _service = service;
        _userManager = userManager;
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

    [HttpPut("account")]
    public async Task<IActionResult> UpdateAccount([FromBody] UpdateAccountRequest request)
    {
        var user = await _userManager.FindByIdAsync(GetUserId().ToString());
        if (user is null)
            return NotFound(ApiResponse<object>.Fail("User not found."));

        user.FullName = request.FullName.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return BadRequest(ApiResponse<object>.Fail("Failed to update account.", errors));
        }

        var parts = user.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var initials = parts.Length >= 2
            ? $"{char.ToUpperInvariant(parts[0][0])}{char.ToUpperInvariant(parts[^1][0])}"
            : user.FullName.Length >= 2
                ? user.FullName[..2].ToUpperInvariant()
                : user.FullName.ToUpperInvariant();

        return Ok(ApiResponse<object>.Ok(new
        {
            id = user.Id,
            fullName = user.FullName,
            email = user.Email,
            initials
        }, "Account updated."));
    }
}
