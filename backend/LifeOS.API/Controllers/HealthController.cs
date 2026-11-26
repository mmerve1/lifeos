using LifeOS.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace LifeOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var payload = new
        {
            status = "healthy",
            service = "LifeOS.API",
            timestamp = DateTime.UtcNow,
        };

        return Ok(ApiResponse<object>.Ok(payload, "LifeOS API is running."));
    }
}
