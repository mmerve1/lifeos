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
public class GoalsController : ControllerBase
{
    private readonly IHabitGoalService _service;

    public GoalsController(IHabitGoalService service)
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
        var goals = await _service.GetGoalsAsync(GetUserId(), ct);
        return Ok(ApiResponse<IReadOnlyList<GoalDto>>.Ok(goals));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGoalRequest request, CancellationToken ct)
    {
        var created = await _service.CreateGoalAsync(GetUserId(), request, ct);
        return Ok(ApiResponse<GoalDto>.Ok(created, "Goal created."));
    }

    [HttpPatch("{id:guid}/step")]
    public async Task<IActionResult> Step(Guid id, [FromBody] StepGoalRequest request, CancellationToken ct)
    {
        var updated = await _service.StepGoalAsync(GetUserId(), id, request.Delta, ct);
        return Ok(ApiResponse<GoalDto>.Ok(updated, "Goal progress updated."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteGoalAsync(GetUserId(), id, ct);
        return Ok(ApiResponse<object>.Ok(new { deleted = true }, "Goal deleted."));
    }
}
