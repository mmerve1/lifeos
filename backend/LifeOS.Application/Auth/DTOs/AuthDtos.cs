using System.ComponentModel.DataAnnotations;

namespace LifeOS.Application.Auth.DTOs;

public record RegisterRequest(
    [Required, MinLength(2), MaxLength(150)] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record RefreshTokenRequest(
    [Required] string AccessToken,
    [Required] string RefreshToken
);

public record ForgotPasswordRequest(
    [Required, EmailAddress] string Email
);

public record ResetPasswordRequest(
    [Required, EmailAddress] string Email,
    [Required, StringLength(6, MinimumLength = 6)] string Code,
    [Required, MinLength(8)] string NewPassword
);

public record UserDto(
    Guid Id,
    string FullName,
    string Email,
    string Initials
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record ForgotPasswordResponse(
    string Message,
    string? DevCode
);
