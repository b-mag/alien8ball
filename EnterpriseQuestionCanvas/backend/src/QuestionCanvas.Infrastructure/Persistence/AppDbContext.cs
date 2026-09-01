using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using QuestionCanvas.Domain.Entities;
using QuestionCanvas.Infrastructure.Identity;

namespace QuestionCanvas.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<QuestionEntry> QuestionEntries => Set<QuestionEntry>();
    public DbSet<QuestionProject> QuestionProjects => Set<QuestionProject>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<QuestionProject>(entity =>
        {
            entity.ToTable("QuestionProjects");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name).IsRequired().HasMaxLength(120);

            entity.Property(x => x.NormalizedName).IsRequired().HasMaxLength(120);

            entity.Property(x => x.OwnerUserId).IsRequired().HasMaxLength(450);

            entity.HasIndex(x => new { x.OwnerUserId, x.NormalizedName }).IsUnique();

            entity.HasMany(x => x.Questions)
                .WithOne(q => q.Project)
                .HasForeignKey(q => q.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QuestionEntry>(entity =>
        {
            entity.ToTable("QuestionEntries");
            entity.HasKey(x => x.Id);

            entity.Property(x => x.QuestionText).IsRequired().HasMaxLength(1000);

            entity.Property(x => x.OwnerUserId).IsRequired().HasMaxLength(450);

            entity.HasIndex(x => new { x.ProjectId, x.CreatedUtc }).IsUnique();

            entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(x => x.OwnerUserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}