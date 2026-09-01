using QuestionCanvas.Application.Contracts;
using QuestionCanvas.Application.Exceptions;
using QuestionCanvas.Application.Persistence;
using QuestionCanvas.Application.Security;
using QuestionCanvas.Domain.Entities;

namespace QuestionCanvas.Application.Services;

public sealed class QuestionWorkspaceService(IQuestionWorkspaceRepository repository,
    ICurrentUserService currentUser) : IQuestionWorkspaceService
{
    public async Task<ProjectSummaryDto> CreateProjectAsync(
        CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var projectName = request.ProjectName.Trim();
        if (projectName.Length < 1 || projectName.Length > 120)
        {
            throw new AppValidationException("Project name must be between 1 and 120 characters.");
        }

        var normalizedName = projectName.ToUpperInvariant();
        var exists = await repository.ProjectNameExistsForUserAsync(currentUser.UserId, normalizedName, cancellationToken);

        if (exists)
        {
            throw new ConflictException("You already have a project with that name.");
        }

        var project = new QuestionProject
        {
            Name = projectName,
            NormalizedName = normalizedName,
            OwnerUserId = currentUser.UserId,
        };

        return ToSummary(project);

    }

    public async Task<IReadOnlyList<ProjectSummaryDto>> ListProjectsAsync(CancellationToken cancellationToken)
    {
        var projects = await repository.ListOwnedProjectsAsync(currentUser.UserId, cancellationToken);

        return projects.Select(ToSummary).ToList();
    }

    public async Task<ProjectDetailsDto> GetProjectAsync(Guid projectId, CancellationToken cancellationToken)
    {
        var project = await repository.GetOwnedProjectDetailsAsync(
        projectId,
        currentUser.UserId,
        cancellationToken);
        if (project is null)
        {
            throw new NotFoundException("Project was not found.");
        }
        return new ProjectDetailsDto(
            project.Id,
            project.Name,
            project.CreatedUtc,
            project.Questions
                .OrderByDescending(q => q.CreatedUtc)
                .Select(q => new QuestionDto(q.Id, q.QuestionText, q.CreatedUtc))
                .ToList());
    }

    public async Task<QuestionDto> AddQuestionAsync(
        Guid projectId,
        CreateQuestionRequest request,
        CancellationToken cancellationToken)
    {
        var questionText = request.Question.Trim();
        if (questionText.Length < 1 || questionText.Length > 2000)
        {
            throw new AppValidationException("Question must be between 1 and 2000 characters.");
        }

        var project = await repository.GetOwnedProjectForUpdateAsync(projectId, currentUser.UserId, cancellationToken);
        if (project is null)
        {
            throw new NotFoundException("Project not found.");
        }

        var question = new QuestionEntry
        {
            ProjectId = project.Id,
            QuestionText = questionText,
            OwnerUserId = currentUser.UserId
        };

        project.Questions.Add(question);
        await repository.SaveChangesAsync(cancellationToken);

        return new QuestionDto(question.Id, question.QuestionText, question.CreatedUtc);
    }
    private static ProjectSummaryDto ToSummary(QuestionProject project) =>
        new(
            project.Id,
            project.Name,
            project.Questions.Count,
            project.CreatedUtc);
}