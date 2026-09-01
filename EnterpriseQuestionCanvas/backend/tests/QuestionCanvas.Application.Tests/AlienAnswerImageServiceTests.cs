using QuestionCanvas.Application.Services;
using SixLabors.ImageSharp;

namespace QuestionCanvas.Application.Tests;

public sealed class AlienAnswerImageServiceTests
{
    private readonly AlienAnswerImageService _service = new();
    private static readonly Guid ProjectId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static readonly Guid QuestionId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
    private const string QuestionText = "What is the meaning of life?";

    [Fact]
    public void GenerateAnswerImage_SameInputs_ProducesIdenticalBytes()
    {
        var first = _service.GenerateAnswerImage(ProjectId, QuestionId, QuestionText);
        var second = _service.GenerateAnswerImage(ProjectId, QuestionId, QuestionText);

        Assert.Equal(first, second);
    }

    [Fact]
    public void GenerateAnswerImage_DifferentQuestionText_ProducesDifferentBytes()
    {
        var first = _service.GenerateAnswerImage(ProjectId, QuestionId, "Question one");
        var second = _service.GenerateAnswerImage(ProjectId, QuestionId, "Question two");

        Assert.NotEqual(first, second);
    }

    [Fact]
    public void GenerateAnswerImage_ReturnsValidPng()
    {
        var bytes = _service.GenerateAnswerImage(ProjectId, QuestionId, QuestionText);

        Assert.NotEmpty(bytes);
        Assert.Equal(0x89, bytes[0]);
        Assert.Equal(0x50, bytes[1]);
        Assert.Equal(0x4E, bytes[2]);
        Assert.Equal(0x47, bytes[3]);
    }

    [Fact]
    public void GenerateAnswerImage_HasExpectedDimensions()
    {
        var bytes = _service.GenerateAnswerImage(ProjectId, QuestionId, QuestionText);

        using var image = Image.Load(bytes);

        Assert.Equal(AlienAnswerGenerator.ImageSize, image.Width);
        Assert.Equal(AlienAnswerGenerator.ImageSize, image.Height);
    }
}
