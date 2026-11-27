using LifeOS.Application.Profile.DTOs;
using LifeOS.Application.Profile.Interfaces;
using LifeOS.Domain.Entities;
using LifeOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Infrastructure.Profile;

public class LifeProfileService : ILifeProfileService
{
    private readonly LifeOSDbContext _db;

    public LifeProfileService(LifeOSDbContext db)
    {
        _db = db;
    }

    public async Task<LifeProfileDto?> GetAsync(Guid userId, CancellationToken ct = default)
    {
        var entity = await _db.UserLifeProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);

        return entity is null ? null : ToDto(entity);
    }

    public async Task<LifeProfileDto> SaveOnboardingAsync(
        Guid userId,
        SaveOnboardingRequest request,
        CancellationToken ct = default)
    {
        var normalizedAreas = request.FocusAreas
            .Where(a => !string.IsNullOrWhiteSpace(a))
            .Select(a => a.Trim().ToLowerInvariant())
            .Distinct()
            .ToList();

        var areasCsv = string.Join(",", normalizedAreas);

        var entity = await _db.UserLifeProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);

        if (entity is null)
        {
            entity = new UserLifeProfile
            {
                UserId = userId,
                LifeStage = request.LifeStage.Trim(),
                FocusAreas = areasCsv,
                PrimaryGoal = request.PrimaryGoal.Trim(),
                PeakTime = string.IsNullOrWhiteSpace(request.PeakTime) ? "morning" : request.PeakTime.Trim().ToLowerInvariant(),
                MentorStyle = string.IsNullOrWhiteSpace(request.MentorStyle) ? "supportive" : request.MentorStyle.Trim().ToLowerInvariant(),
                OnboardingCompleted = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _db.UserLifeProfiles.Add(entity);
        }
        else
        {
            entity.LifeStage = request.LifeStage.Trim();
            entity.FocusAreas = areasCsv;
            entity.PrimaryGoal = request.PrimaryGoal.Trim();
            entity.PeakTime = string.IsNullOrWhiteSpace(request.PeakTime) ? "morning" : request.PeakTime.Trim().ToLowerInvariant();
            entity.MentorStyle = string.IsNullOrWhiteSpace(request.MentorStyle) ? "supportive" : request.MentorStyle.Trim().ToLowerInvariant();
            entity.OnboardingCompleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    private static LifeProfileDto ToDto(UserLifeProfile p) => new(
        Id: p.Id,
        LifeStage: p.LifeStage,
        FocusAreas: string.IsNullOrWhiteSpace(p.FocusAreas)
            ? Array.Empty<string>()
            : p.FocusAreas.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
        PrimaryGoal: p.PrimaryGoal,
        PeakTime: p.PeakTime,
        MentorStyle: p.MentorStyle,
        OnboardingCompleted: p.OnboardingCompleted,
        UpdatedAt: p.UpdatedAt
    );
}
