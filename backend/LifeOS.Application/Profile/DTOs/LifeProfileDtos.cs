using System.ComponentModel.DataAnnotations;

namespace LifeOS.Application.Profile.DTOs;

public record LifeProfileDto(
    Guid Id,
    string LifeStage,
    IReadOnlyList<string> FocusAreas,
    string PrimaryGoal,
    string PeakTime,
    string MentorStyle,
    bool OnboardingCompleted,
    DateTime UpdatedAt
);

public record SaveOnboardingRequest(
    [Required, MinLength(1), MaxLength(120)] string LifeStage,
    [Required] IReadOnlyList<string> FocusAreas,
    [Required, MinLength(1), MaxLength(500)] string PrimaryGoal,
    [MaxLength(40)] string PeakTime = "morning",
    [MaxLength(40)] string MentorStyle = "supportive"
);
