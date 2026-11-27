using LifeOS.Application.Profile.DTOs;

namespace LifeOS.Application.Profile.Interfaces;

public interface ILifeProfileService
{
    Task<LifeProfileDto?> GetAsync(Guid userId, CancellationToken ct = default);
    Task<LifeProfileDto> SaveOnboardingAsync(Guid userId, SaveOnboardingRequest request, CancellationToken ct = default);
}
