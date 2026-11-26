using LifeOS.API.Controllers;
using LifeOS.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace LifeOS.Tests;

public class HealthAndResponseTests
{
    [Fact]
    public void ApiResponse_Ok_SetsSuccessTrueAndData()
    {
        var response = ApiResponse<string>.Ok("test-data", "Success");

        Assert.True(response.Success);
        Assert.Equal("test-data", response.Data);
        Assert.Equal("Success", response.Message);
        Assert.Null(response.Errors);
    }

    [Fact]
    public void ApiResponse_Fail_SetsSuccessFalseAndErrors()
    {
        var response = ApiResponse<string>.Fail("Validation failed", new[] { "Email is required" });

        Assert.False(response.Success);
        Assert.Null(response.Data);
        Assert.Equal("Validation failed", response.Message);
        Assert.Single(response.Errors!);
    }

    [Fact]
    public void HealthController_Get_ReturnsOkResult()
    {
        var controller = new HealthController();

        var result = controller.Get();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<ApiResponse<object>>(okResult.Value);
        Assert.True(response.Success);
    }
}
