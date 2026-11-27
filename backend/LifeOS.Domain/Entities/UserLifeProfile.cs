using LifeOS.Domain.Common;

namespace LifeOS.Domain.Entities;

public class UserLifeProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public string LifeStage { get; set; } = string.Empty;      // e.g. "student", "working", "job_seeker", "entrepreneur", or custom
    public string FocusAreas { get; set; } = string.Empty;     // CSV of ModuleCategory values e.g. "career,health,learning"
    public string PrimaryGoal { get; set; } = string.Empty;
    public string PeakTime { get; set; } = "morning";          // "morning" | "afternoon" | "evening"
    public string MentorStyle { get; set; } = "supportive";    // "supportive" | "direct" | "concise"
    public bool OnboardingCompleted { get; set; } = false;
}
