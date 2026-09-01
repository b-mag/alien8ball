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

   public async Task<IReadOnlyList<QuestionProject>> ListOwnedProjectsAsync(
        string ownerUserId,
        CancellationToken cancellationToken) =>
        await dbContext.QuestionProjects
            .AsNoTracking()
            .Where(p => p.OwnerUserId == ownerUserId)
            .Include(p => p.Questions)
            .OrderByDescending(p => p.CreatedUtc)
            .ToListAsync(cancellationToken);
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