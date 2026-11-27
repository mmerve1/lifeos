using System.Text.RegularExpressions;
using LifeOS.Application.Mentor.DTOs;
using LifeOS.Application.Mentor.Interfaces;

namespace LifeOS.Infrastructure.Mentor;

/// <summary>
/// Pluggable IAIProvider implementation.
/// Uses selective LifeOS context (Profile, Tasks, Habits, Goals, Memories) and
/// detects actionable intents (e.g. creating a task) requiring explicit user approval.
/// Can be swapped with an OpenAI / Gemini HTTP provider without changing AIMentorService.
/// </summary>
public class SmartRuleBasedAIProvider : IAIProvider
{
    public Task<AIProviderReply> GenerateReplyAsync(
        string userMessage,
        string language,
        MentorContextSnapshot ctx,
        CancellationToken ct = default)
    {
        var msg = userMessage.Trim();
        var lower = msg.Replace('İ', 'i').Replace('I', 'i').ToLowerInvariant();
        var isTr = !language.Equals("en", StringComparison.OrdinalIgnoreCase);

        // 1. Detect Task Creation intent
        if (lower.Contains("görev") || lower.Contains("ekle") || lower.Contains("oluştur") ||
            lower.Contains("task") || lower.Contains("create") || lower.Contains("remind"))
        {
            var isTomorrow = lower.Contains("yarın") || lower.Contains("tomorrow");
            var dueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(isTomorrow ? 1 : 0)).ToString("yyyy-MM-dd");

            var timeMatch = Regex.Match(msg, @"\b([01]?\d|2[0-3])[:.]([0-5]\d)\b");
            var dueTime = timeMatch.Success
                ? $"{timeMatch.Groups[1].Value.PadLeft(2, '0')}:{timeMatch.Groups[2].Value}"
                : ctx.PeakTime == "evening" ? "19:30" : ctx.PeakTime == "afternoon" ? "14:00" : "10:00";

            var category = InferCategory(lower, ctx.FocusAreas);
            var cleanTitle = ExtractTaskTitle(msg, isTr);

            var proposed = new ProposedTaskActionDto(
                Type: "create_task",
                Title: cleanTitle,
                Category: category,
                Priority: "medium",
                DueDate: dueDate,
                DueTime: dueTime
            );

            var replyText = isTr
                ? $"Harika fikir {ctx.UserName}! Aşağıdaki görevi planına ekleyebilirim. Onaylarsan doğrudan Görevler ve Takvim'e kaydedeceğim:"
                : $"Great idea {ctx.UserName}! I prepared this task for your schedule. Approve below to add it to Tasks & Calendar:";

            return Task.FromResult(new AIProviderReply(replyText, proposed));
        }

        // 2. Progress / Analysis intent
        if (lower.Contains("analiz") || lower.Contains("ilerleme") || lower.Contains("durum") ||
            lower.Contains("progress") || lower.Contains("analyze"))
        {
            var replyText = isTr
                ? $"İşte izin verdiğin verilere göre güncel durumun {ctx.UserName}:\n" +
                  (ctx.Permissions.AllowTasks
                      ? $"• Görevler: {ctx.CompletedTaskCount} tamamlandı, {ctx.ActiveTaskCount} aktif görev bekliyor.\n"
                      : "• Görev verisi izni kapalı.\n") +
                  (ctx.Permissions.AllowHabits
                      ? $"• Alışkanlık & Hedefler: {ctx.HabitCount} alışkanlık ve {ctx.GoalCount} hedef takip ediliyor.\n"
                      : "• Alışkanlık verisi izni kapalı.\n") +
                  (!string.IsNullOrWhiteSpace(ctx.PrimaryGoal)
                      ? $"\nAna hedefin (“{ctx.PrimaryGoal}”) için en verimli saatin olan {(ctx.PeakTime == "evening" ? "akşam" : ctx.PeakTime == "afternoon" ? "gündüz" : "sabah")} bloğunda tek bir odak görevi seçerek ivmeni koruyabilirsin."
                      : "\nKüçük ve istikrarlı adımlarla harika ilerliyorsun!")
                : $"Here is your live snapshot {ctx.UserName}:\n" +
                  (ctx.Permissions.AllowTasks
                      ? $"• Tasks: {ctx.CompletedTaskCount} completed, {ctx.ActiveTaskCount} active.\n"
                      : "• Task data permission is off.\n") +
                  (ctx.Permissions.AllowHabits
                      ? $"• Habits & Goals: {ctx.HabitCount} habits and {ctx.GoalCount} goals tracked.\n"
                      : "• Habits permission is off.\n") +
                  (!string.IsNullOrWhiteSpace(ctx.PrimaryGoal)
                      ? $"\nFocus one dedicated block during your {ctx.PeakTime} peak window for “{ctx.PrimaryGoal}”."
                      : "\nKeep building momentum one step at a time!");

            return Task.FromResult(new AIProviderReply(replyText));
        }

        // 3. Weekly planning / Goal evaluation intent
        if (lower.Contains("plan") || lower.Contains("hafta") || lower.Contains("hedef") ||
            lower.Contains("week") || lower.Contains("goal"))
        {
            var focusList = ctx.FocusAreas.Count > 0 ? string.Join(", ", ctx.FocusAreas) : (isTr ? "kişisel düzen" : "personal clarity");
            var goalText = !string.IsNullOrWhiteSpace(ctx.PrimaryGoal)
                ? ctx.PrimaryGoal
                : (isTr ? "günlük odak ritmini oturtmak" : "building your daily focus rhythm");

            var replyText = isTr
                ? $"Öncelikli alanların ({focusList}) ve ana hedefin (“{goalText}”) için şu 3 adımlı haftalık planı öneriyorum:\n" +
                  $"1. En verimli zamanında ({(ctx.PeakTime == "evening" ? "19:30" : "10:00")}) 45 dakikalık kesintisiz odak bloğu ayır.\n" +
                  $"2. Aktif görevlerinden ({ctx.ActiveTaskCount} adet) her gün en fazla 3 tanesini 'bugün' olarak işaretle.\n" +
                  $"3. Hafta sonu 15 dakika ayırıp hedeflerini gözden geçir.\n\nİstersen ilk odak bloğunu senin için görev olarak hazırlayayım mı?"
                : $"Based on your focus areas ({focusList}) and main goal (“{goalText}”), here is a 3-step plan:\n" +
                  $"1. Protect a 45-minute deep-work block during your {ctx.PeakTime} peak.\n" +
                  $"2. Pick at most 3 of your {ctx.ActiveTaskCount} active tasks for today.\n" +
                  $"3. Spend 15 minutes this weekend reviewing your goals.\n\nWant me to draft a task block for you?";

            return Task.FromResult(new AIProviderReply(replyText));
        }

        // 4. General supportive conversational reply
        var generalReply = isTr
            ? $"Seni dinliyorum {ctx.UserName}! " +
              (!string.IsNullOrWhiteSpace(ctx.PrimaryGoal)
                  ? $"“{ctx.PrimaryGoal}” hedefini aklımda tutuyorum. "
                  : string.Empty) +
              "Benden haftanı planlamamı, ilerlemeni analiz etmemi ya da “Yarın 10:00 İngilizce çalışmak için görev oluştur” gibi doğrudan görev hazırlamamı isteyebilirsin."
            : $"I'm here with you {ctx.UserName}! " +
              (!string.IsNullOrWhiteSpace(ctx.PrimaryGoal)
                  ? $"Keeping your main goal (“{ctx.PrimaryGoal}”) in mind. "
                  : string.Empty) +
              "You can ask me to plan your week, analyze your progress, or say “Create a task to study English tomorrow at 10:00”.";

        return Task.FromResult(new AIProviderReply(generalReply));
    }

    private static string InferCategory(string lower, IReadOnlyList<string> focusAreas)
    {
        if (lower.Contains("cv") || lower.Contains("başvuru") || lower.Contains("mülakat") || lower.Contains("kariyer") || lower.Contains("career"))
            return "career";
        if (lower.Contains("ingilizce") || lower.Contains("kitap") || lower.Contains("kurs") || lower.Contains("english") || lower.Contains("learn"))
            return "learning";
        if (lower.Contains("sınav") || lower.Contains("ders") || lower.Contains("ödev") || lower.Contains("exam") || lower.Contains("study"))
            return "academic";
        if (lower.Contains("bütçe") || lower.Contains("fatura") || lower.Contains("ödeme") || lower.Contains("finance"))
            return "finance";
        if (lower.Contains("spor") || lower.Contains("yürüyüş") || lower.Contains("su") || lower.Contains("workout") || lower.Contains("health"))
            return "health";
        return focusAreas.FirstOrDefault() ?? "personal";
    }

    private static string ExtractTaskTitle(string msg, bool isTr)
    {
        var cleaned = Regex.Replace(msg, @"\b(yarın|bugün|tomorrow|today|saat|at)\b", "", RegexOptions.IgnoreCase);
        cleaned = Regex.Replace(cleaned, @"\b([01]?\d|2[0-3])[:.]([0-5]\d)\b", "");
        cleaned = Regex.Replace(cleaned, @"(için\s+)?(bir\s+)?(görev\s*(oluştur(ur musun)?|ekle(r misin)?)|create\s+a?\s*task(\s+to)?)", "", RegexOptions.IgnoreCase);
        cleaned = Regex.Replace(cleaned, @"[?!]+", "").Trim();
        cleaned = Regex.Replace(cleaned, @"\s{2,}", " ");

        if (cleaned.Length < 3)
            return isTr ? "Mentor odak görevi" : "Mentor focus task";

        return char.ToUpper(cleaned[0]) + cleaned[1..];
    }
}
