using QuestionCanvas.Application.Contracts;

namespace QuestionCanvas.Application.Services;

public interface IQuestionWorkspaceService
{

    Task<ProjectSummaryDto> CreateProjectAsync(
        CreateProjectRequest request,
        CancellationToken cancellationToken);
    Task<IReadOnlyList<ProjectSummaryDto>> ListProjectsAsync(
        CancellationToken cancellationToken);
    Task<ProjectDetailsDto> GetProjectAsync(
        Guid projectId,
        CancellationToken cancellationToken);
    Task<QuestionDto> AddQuestionAsync(
        Guid projectId,
        CreateQuestionRequest request,
        CancellationToken cancellationToken);
    Task<byte[]> GetAnswerImageAsync(
        Guid projectId,
        Guid questionId,
        CancellationToken cancellationToken);
}