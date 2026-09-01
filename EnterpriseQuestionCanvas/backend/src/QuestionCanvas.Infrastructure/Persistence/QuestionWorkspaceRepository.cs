using Microsoft.EntityFrameworkCore;
using QuestionCanvas.Domain.Entities;
using QuestionCanvas.Application.Persistence;

namespace QuestionCanvas.Infrastructure.Persistence;

public class QuestionWorkspaceRepository(AppDbContext dbContext) : IQuestionWorkspaceRepository
{
    public Task<bool> ProjectNameExistsForUserAsync(
         string ownerUserId,
         string normalizedName,
         CancellationToken cancellationToken) =>
         dbContext.QuestionProjects.AnyAsync(
             p => p.OwnerUserId == ownerUserId &&
                  p.NormalizedName == normalizedName,
             cancellationToken);

    public async Task AddProjectAsync(QuestionProject project, CancellationToken cancellationToken)
    {
        await dbContext.QuestionProjects.AddAsync(project, cancellationToken);
    }

    public async Task AddQuestionAsync(QuestionEntry question, CancellationToken cancellationToken)
    {
        // Add explicitly so EF marks the entity state as Added and issues an
        // INSERT. The QuestionEntry.Id is client-generated (Guid.NewGuid()),
        // so adding via the parent collection can make EF treat it as an
        // existing row and attempt an UPDATE instead.
        await dbContext.QuestionEntries.AddAsync(question, cancellationToken);
    }

    public async Task<IReadOnlyList<QuestionProject>> ListOwnedProjectsAsync(
         string ownerUserId,
         CancellationToken cancellationToken)
    {
        // Materialize the query first, then order in memory. Ordering by a
        // DateTimeOffset column inside the provider-translated query is not
        // supported by all providers (e.g. SQLite cannot translate ORDER BY
        // over DateTimeOffset). Sorting after materialization keeps this
        // provider-agnostic while preserving newest-first ordering.
        var projects = await dbContext.QuestionProjects
            .AsNoTracking()
            .Where(p => p.OwnerUserId == ownerUserId)
            .Include(p => p.Questions)
            .ToListAsync(cancellationToken);

        return projects
            .OrderByDescending(p => p.CreatedUtc)
            .ToList();
    }
    public Task<QuestionProject?> GetOwnedProjectDetailsAsync(
        Guid projectId,
        string ownerUserId,
        CancellationToken cancellationToken) =>
        dbContext.QuestionProjects
            .AsNoTracking()
            .Where(p => p.Id == projectId && p.OwnerUserId == ownerUserId)
            .Include(p => p.Questions)
            .SingleOrDefaultAsync(cancellationToken);
    public Task<QuestionProject?> GetOwnedProjectForUpdateAsync(
        Guid projectId,
        string ownerUserId,
        CancellationToken cancellationToken) =>
        dbContext.QuestionProjects
            .Where(p => p.Id == projectId && p.OwnerUserId == ownerUserId)
            .SingleOrDefaultAsync(cancellationToken);
    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}