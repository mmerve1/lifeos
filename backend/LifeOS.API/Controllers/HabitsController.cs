using System.Security.Claims;
using LifeOS.Application.Common.Models;
using LifeOS.Application.Habits.DTOs;
using LifeOS.Application.Habits.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LifeOS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class HabitsController : ControllerBase
{
    private readonly IHabitGoalService _service;

    public HabitsController(IHabitGoalService service)
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

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var habits = await _service.GetHabitsAsync(GetUserId(), ct);
        return Ok(ApiResponse<IReadOnlyList<HabitDto>>.Ok(habits));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHabitRequest request, CancellationToken ct)
    {
        var created = await _service.CreateHabitAsync(GetUserId(), request, ct);
        return Ok(ApiResponse<HabitDto>.Ok(created, "Habit created."));
    }

    [HttpPost("{id:guid}/toggle")]
    public async Task<IActionResult> ToggleDate(Guid id, [FromBody] ToggleHabitDateRequest request, CancellationToken ct)
    {
        var updated = await _service.ToggleHabitDateAsync(GetUserId(), id, request.Date, ct);
        return Ok(ApiResponse<HabitDto>.Ok(updated, "Habit log updated."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteHabitAsync(GetUserId(), id, ct);
        return Ok(ApiResponse<object>.Ok(new { deleted = true }, "Habit deleted."));
    }
}
