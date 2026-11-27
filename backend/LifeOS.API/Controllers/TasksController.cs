using System.Security.Claims;
using LifeOS.Application.Common.Models;
using LifeOS.Application.Tasks.DTOs;
using LifeOS.Application.Tasks.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LifeOS.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    private Guid GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user claim.");
        }
        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? dueDate,
        CancellationToken ct)
    {
        var tasks = await _taskService.GetAllAsync(GetUserId(), status, dueDate, ct);
        return Ok(ApiResponse<IReadOnlyList<TaskDto>>.Ok(tasks));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetTodayStats(CancellationToken ct)
    {
        var stats = await _taskService.GetTodayStatsAsync(GetUserId(), ct);
        return Ok(ApiResponse<TaskStatsDto>.Ok(stats));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var task = await _taskService.GetByIdAsync(GetUserId(), id, ct);
        return Ok(ApiResponse<TaskDto>.Ok(task));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request, CancellationToken ct)
    {
        var created = await _taskService.CreateAsync(GetUserId(), request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse<TaskDto>.Ok(created, "Task created."));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskRequest request, CancellationToken ct)
    {
        var updated = await _taskService.UpdateAsync(GetUserId(), id, request, ct);
        return Ok(ApiResponse<TaskDto>.Ok(updated, "Task updated."));
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
    {
        var toggled = await _taskService.ToggleAsync(GetUserId(), id, ct);
        return Ok(ApiResponse<TaskDto>.Ok(toggled, "Task status updated."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _taskService.DeleteAsync(GetUserId(), id, ct);
        return Ok(ApiResponse<object>.Ok(new { deleted = true }, "Task deleted."));
    }
}
