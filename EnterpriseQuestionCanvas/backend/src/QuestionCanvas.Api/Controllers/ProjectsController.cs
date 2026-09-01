using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using QuestionCanvas.Application.Contracts;
using QuestionCanvas.Application.Services;

namespace QuestionCanvas.Api.Controllers;

[ApiController]
[Route("api/projects")]
[Authorize]
[EnableRateLimiting("authenticated-api")]
public sealed class ProjectsController(IQuestionWorkspaceService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProjectSummaryDto>>> List(
        CancellationToken cancellationToken)
    {
        var projects = await service.ListProjectsAsync(cancellationToken);

        return Ok(projects);
    }

    [HttpGet("{projectId:guid}")]
    public async Task<ActionResult<ProjectDetailsDto>> GetById(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var project = await service.GetProjectAsync(
            projectId,
            cancellationToken);

        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectSummaryDto>> Create(
        [FromBody] CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var project = await service.CreateProjectAsync(
            request,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { projectId = project.Id },
            project);

    }

    [HttpPost("{projectId:guid}/questions")]
    public async Task<ActionResult<QuestionDto>> AddQuestion(
        Guid projectId,
        [FromBody] CreateQuestionRequest request,
        CancellationToken cancellationToken)
    {
        var question = await service.AddQuestionAsync(
            projectId,
            request,
            cancellationToken);

        return Created(
            $"/api/projects/{projectId}/questions/{question.Id}",
            question);
    }

    [HttpGet("{projectId:guid}/questions/{questionId:guid}/answer-image")]
    public async Task<IActionResult> GetAnswerImage(
        Guid projectId,
        Guid questionId,
        CancellationToken cancellationToken)
    {
        var imageBytes = await service.GetAnswerImageAsync(
            projectId,
            questionId,
            cancellationToken);

        return File(imageBytes, "image/png");
    }
}