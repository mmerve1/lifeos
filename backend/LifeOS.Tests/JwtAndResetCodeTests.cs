using System.Security.Claims;
using LifeOS.Infrastructure.Auth;
using LifeOS.Infrastructure.Identity;
using Microsoft.Extensions.Options;

namespace LifeOS.Tests;

public class JwtAndResetCodeTests
{
    private static JwtTokenService CreateTokenService()
    {
        var settings = Options.Create(new JwtSettings
        {
            Secret = "Test_Secret_Key_For_LifeOS_Unit_Tests_1234567890_ABCDEF",
            Issuer = "LifeOS.API",
            Audience = "LifeOS.Clients",
            AccessTokenExpirationMinutes = 30,
            RefreshTokenExpirationDays = 7
        });
        return new JwtTokenService(settings);
    }

    [Fact]
    public void GenerateAccessToken_ContainsExpectedUserClaims()
    {
        var service = CreateTokenService();
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FullName = "Merve",
            Email = "merve@example.com"
        };

        var (token, expiresAt) = service.GenerateAccessToken(user);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.True(expiresAt > DateTime.UtcNow);

        var principal = service.GetPrincipalFromExpiredToken(token);
        Assert.NotNull(principal);
        Assert.Equal(user.Id.ToString(), principal!.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.Equal("merve@example.com", principal.FindFirstValue(ClaimTypes.Email));
    }

    [Fact]
    public void GenerateRefreshToken_ReturnsUniqueNonEmptyStrings()
    {
        var service = CreateTokenService();

        var token1 = service.GenerateRefreshToken();
        var token2 = service.GenerateRefreshToken();

        Assert.False(string.IsNullOrWhiteSpace(token1));
        Assert.NotEqual(token1, token2);
    }

    [Fact]
    public void PasswordResetCodeStore_IssuesSixDigitCodeAndConsumesOnce()
    {
        var store = new InMemoryPasswordResetCodeStore();
        var code = store.IssueCode("Merve@Example.com", TimeSpan.FromMinutes(10));

        Assert.Equal(6, code.Length);
        Assert.True(int.TryParse(code, out _));

        // First validation succeeds
        Assert.True(store.ValidateAndConsume("merve@example.com", code));
        // Second validation fails (single-use)
        Assert.False(store.ValidateAndConsume("merve@example.com", code));
    }
}
