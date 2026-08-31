using System.ComponentModel.DataAnnotations;

namespace QuestionCanvas.Application.Contracts;

public sealed class CreateProjectRequest
{
    [Required]
    [StringLength(120, MinimumLength = 1)]
    public string ProjectName { get; init; } = string.Empty;
}

public sealed class CreateQuestionRequest
{
    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Question { get; init; } = string.Empty;
}

public sealed record ProjectSummaryDto(Guid Id, string ProjectName, int QuestionCount, DateTimeOffset CreatedUtc);

public sealed record QuestionDto(Guid Id, string Question, DateTimeOffset CreatedUtc);

public sealed record ProjectDetailsDto(Guid Id, string ProjectName, DateTimeOffset CreatedUtc, IReadOnlyList<QuestionDto> Questions);