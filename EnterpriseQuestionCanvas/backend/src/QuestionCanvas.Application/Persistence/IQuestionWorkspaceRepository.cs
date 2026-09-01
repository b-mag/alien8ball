using QuestionCanvas.Domain.Entities;

namespace QuestionCanvas.Application.Persistence;

public interface IQuestionWorkspaceRepository
{

    Task<bool> ProjectNameExistsForUserAsync(
        string ownerUserId,
        string normalizedName,
        CancellationToken cancellationToken);
    Task AddProjectAsync(
        QuestionProject project,
        CancellationToken cancellationToken);
    Task AddQuestionAsync(
        QuestionEntry question,
        CancellationToken cancellationToken);
    Task<IReadOnlyList<QuestionProject>> ListOwnedProjectsAsync(
        string ownerUserId,
        CancellationToken cancellationToken);
    Task<QuestionProject?> GetOwnedProjectDetailsAsync(
        Guid projectId,
        string ownerUserId,
        CancellationToken cancellationToken);
    Task<QuestionProject?> GetOwnedProjectForUpdateAsync(
        Guid projectId,
        string ownerUserId,
        CancellationToken cancellationToken);
    Task<QuestionEntry?> GetOwnedQuestionAsync(
        Guid projectId,
        Guid questionId,
        string ownerUserId,
        CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}