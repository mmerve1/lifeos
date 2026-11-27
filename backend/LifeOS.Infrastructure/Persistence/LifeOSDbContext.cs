using LifeOS.Domain.Common;
using LifeOS.Domain.Entities;
using LifeOS.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LifeOS.Infrastructure.Persistence;

public class LifeOSDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public LifeOSDbContext(DbContextOptions<LifeOSDbContext> options) : base(options)
    {
    }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<HabitItem> Habits => Set<HabitItem>();
    public DbSet<HabitLog> HabitLogs => Set<HabitLog>();
    public DbSet<GoalItem> Goals => Set<GoalItem>();
    public DbSet<UserLifeProfile> UserLifeProfiles => Set<UserLifeProfile>();
    public DbSet<AiConversation> AiConversations => Set<AiConversation>();
    public DbSet<AiMessage> AiMessages => Set<AiMessage>();
    public DbSet<AiMemory> AiMemories => Set<AiMemory>();
    public DbSet<AiUserPreference> AiUserPreferences => Set<AiUserPreference>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.FullName).HasMaxLength(150).IsRequired();
        });

        builder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("tasks");
            entity.HasKey(t => t.Id);

            entity.Property(t => t.Title).HasMaxLength(200).IsRequired();
            entity.Property(t => t.Description).HasMaxLength(2000);
            entity.Property(t => t.DueTime).HasMaxLength(10);

            entity.Property(t => t.Priority).HasConversion<string>().HasMaxLength(20);
            entity.Property(t => t.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(t => t.Category).HasConversion<string>().HasMaxLength(30);

            entity.HasIndex(t => t.UserId);
            entity.HasIndex(t => new { t.UserId, t.Status });
            entity.HasIndex(t => new { t.UserId, t.DueDate });

            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<HabitItem>(entity =>
        {
            entity.ToTable("habits");
            entity.HasKey(h => h.Id);

            entity.Property(h => h.Title).HasMaxLength(200).IsRequired();
            entity.Property(h => h.Category).HasConversion<string>().HasMaxLength(30);
            entity.HasIndex(h => h.UserId);

            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<HabitLog>(entity =>
        {
            entity.ToTable("habit_logs");
            entity.HasKey(l => l.Id);

            entity.HasIndex(l => new { l.HabitId, l.CompletedDate }).IsUnique();

            entity.HasOne(l => l.Habit)
                .WithMany(h => h.Logs)
                .HasForeignKey(l => l.HabitId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<GoalItem>(entity =>
        {
            entity.ToTable("goals");
            entity.HasKey(g => g.Id);

            entity.Property(g => g.Title).HasMaxLength(200).IsRequired();
            entity.Property(g => g.Description).HasMaxLength(2000);
            entity.Property(g => g.Category).HasConversion<string>().HasMaxLength(30);
            entity.Property(g => g.Period).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(g => g.UserId);

            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(g => g.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<UserLifeProfile>(entity =>
        {
            entity.ToTable("user_life_profiles");
            entity.HasKey(p => p.Id);

            entity.Property(p => p.LifeStage).HasMaxLength(120).IsRequired();
            entity.Property(p => p.FocusAreas).HasMaxLength(300).IsRequired();
            entity.Property(p => p.PrimaryGoal).HasMaxLength(500).IsRequired();
            entity.Property(p => p.PeakTime).HasMaxLength(40).IsRequired();
            entity.Property(p => p.MentorStyle).HasMaxLength(40).IsRequired();

            entity.HasIndex(p => p.UserId).IsUnique();

            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AiConversation>(entity =>
        {
            entity.ToTable("ai_conversations");
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Title).HasMaxLength(200).IsRequired();
            entity.HasIndex(c => c.UserId);
            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AiMessage>(entity =>
        {
            entity.ToTable("ai_messages");
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Role).HasMaxLength(20).IsRequired();
            entity.Property(m => m.Content).HasMaxLength(4000).IsRequired();
            entity.Property(m => m.ProposedActionJson).HasMaxLength(2000);
            entity.Property(m => m.ActionStatus).HasMaxLength(20);
            entity.HasIndex(m => m.ConversationId);
            entity.HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AiMemory>(entity =>
        {
            entity.ToTable("ai_memories");
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Content).HasMaxLength(500).IsRequired();
            entity.Property(m => m.Category).HasMaxLength(40).IsRequired();
            entity.HasIndex(m => m.UserId);
            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AiUserPreference>(entity =>
        {
            entity.ToTable("ai_user_preferences");
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => p.UserId).IsUnique();
            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
