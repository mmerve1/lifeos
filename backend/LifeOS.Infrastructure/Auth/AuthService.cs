using System.Security.Claims;
using LifeOS.Application.Auth.DTOs;
using LifeOS.Application.Auth.Interfaces;
using LifeOS.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace LifeOS.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordResetCodeStore _resetCodeStore;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        IJwtTokenService jwtTokenService,
        IPasswordResetCodeStore resetCodeStore,
        IOptions<JwtSettings> jwtOptions)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _resetCodeStore = resetCodeStore;
        _jwtSettings = jwtOptions.Value;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var existingUser = await _userManager.FindByEmailAsync(email);
        if (existingUser is not null)
        {
            throw new ArgumentException("An account with this email already exists.");
        }

        var user = new ApplicationUser
        {
            FullName = request.FullName.Trim(),
            Email = email,
            UserName = email,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new ArgumentException($"Registration failed: {errors}");
        }

        return await IssueAuthResponseAsync(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        return await IssueAuthResponseAsync(user);
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var principal = _jwtTokenService.GetPrincipalFromExpiredToken(request.AccessToken);
        var userIdStr = principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid access token.");
        }

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null ||
            user.RefreshToken != request.RefreshToken ||
            user.RefreshTokenExpiryTime is null ||
            user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        return await IssueAuthResponseAsync(user);
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            // Do not leak whether the email exists
            return new ForgotPasswordResponse(
                "If this email is registered, a 6-digit verification code has been sent.",
                null
            );
        }

        var code = _resetCodeStore.IssueCode(email, TimeSpan.FromMinutes(15));
        return new ForgotPasswordResponse(
            "If this email is registered, a 6-digit verification code has been sent.",
            code
        );
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (!_resetCodeStore.ValidateAndConsume(email, request.Code))
        {
            throw new ArgumentException("Invalid or expired verification code.");
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        var removeResult = await _userManager.RemovePasswordAsync(user);
        if (!removeResult.Succeeded)
        {
            var errors = string.Join("; ", removeResult.Errors.Select(e => e.Description));
            throw new ArgumentException($"Password reset failed: {errors}");
        }

        var result = await _userManager.AddPasswordAsync(user, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new ArgumentException($"Password reset failed: {errors}");
        }

        // Invalidate existing refresh token
        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;
        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        return ToUserDto(user);
    }

    private async Task<AuthResponse> IssueAuthResponseAsync(ApplicationUser user)
    {
        var (accessToken, expiresAt) = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return new AuthResponse(accessToken, refreshToken, expiresAt, ToUserDto(user));
    }

    private static UserDto ToUserDto(ApplicationUser user)
    {
        var trimmed = (user.FullName ?? string.Empty).Trim();
        var initials = trimmed.Length > 0 ? trimmed[..1].ToUpperInvariant() : "U";
        return new UserDto(user.Id, trimmed, user.Email ?? string.Empty, initials);
    }
}
