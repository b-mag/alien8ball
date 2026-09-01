using QuestionCanvas.Application.Services;

namespace QuestionCanvas.Application.Tests;

public sealed class AlienAnswerGeneratorTests
{
    private static readonly Guid ProjectId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid QuestionId = Guid.Parse("22222222-2222-2222-2222-222222222222");

    [Fact]
    public void DeriveSeed_SameInputs_ProducesSameSeed()
    {
        var first = AlienAnswerGenerator.DeriveSeed(ProjectId, QuestionId, "Will we succeed?");
        var second = AlienAnswerGenerator.DeriveSeed(ProjectId, QuestionId, "Will we succeed?");

        Assert.Equal(first, second);
    }

    [Fact]
    public void DeriveSeed_DifferentQuestionText_ProducesDifferentSeed()
    {
        var first = AlienAnswerGenerator.DeriveSeed(ProjectId, QuestionId, "Question A");
        var second = AlienAnswerGenerator.DeriveSeed(ProjectId, QuestionId, "Question B");

        Assert.NotEqual(first, second);
    }

    [Fact]
    public void GetGlyphCount_ReturnsValueWithinExpectedRange()
    {
        var seed = AlienAnswerGenerator.DeriveSeed(ProjectId, QuestionId, "glyph count test");
        var count = AlienAnswerGenerator.GetGlyphCount(seed);

        Assert.InRange(count, AlienAnswerGenerator.MinGlyphCount, AlienAnswerGenerator.MaxGlyphCount);
    }

    [Fact]
    public void SelectGlyphIndices_ReturnsRequestedCount()
    {
        var seed = AlienAnswerGenerator.DeriveSeed(ProjectId, QuestionId, "indices test");
        var count = AlienAnswerGenerator.GetGlyphCount(seed);
        var indices = AlienAnswerGenerator.SelectGlyphIndices(seed, count);

        Assert.Equal(count, indices.Count);
    }
}
