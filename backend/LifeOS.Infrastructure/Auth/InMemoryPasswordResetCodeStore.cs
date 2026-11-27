using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace LifeOS.Infrastructure.Auth;

public interface IPasswordResetCodeStore
{
    string IssueCode(string email, TimeSpan lifetime);
    bool ValidateAndConsume(string email, string code);
}

public class InMemoryPasswordResetCodeStore : IPasswordResetCodeStore
{
    private readonly ConcurrentDictionary<string, (string Code, DateTime ExpiresAt)> _codes = new();

    public string IssueCode(string email, TimeSpan lifetime)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var code = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        _codes[normalized] = (code, DateTime.UtcNow.Add(lifetime));
        return code;
    }

    public bool ValidateAndConsume(string email, string code)
    {
        var normalized = email.Trim().ToLowerInvariant();
        if (!_codes.TryGetValue(normalized, out var entry))
        {
            return false;
        }

        if (entry.ExpiresAt < DateTime.UtcNow || entry.Code != code.Trim())
        {
            return false;
        }

        _codes.TryRemove(normalized, out _);
        return true;
    }
}
