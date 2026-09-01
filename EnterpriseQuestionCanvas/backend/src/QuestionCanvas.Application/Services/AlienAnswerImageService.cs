using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace QuestionCanvas.Application.Services;

public sealed class AlienAnswerImageService : IAlienAnswerImageService
{
    public byte[] GenerateAnswerImage(Guid projectId, Guid questionId, string questionText)
    {
        var seed = AlienAnswerGenerator.DeriveSeed(projectId, questionId, questionText);
        var glyphCount = AlienAnswerGenerator.GetGlyphCount(seed);
        var glyphIndices = AlienAnswerGenerator.SelectGlyphIndices(seed, glyphCount);
        var random = new Random(seed ^ 0x5A17C0DE);

        using var image = new Image<Rgba32>(AlienAnswerGenerator.ImageSize, AlienAnswerGenerator.ImageSize);
        image.Mutate(ctx => ctx.BackgroundColor(Color.Black));

        var columns = Math.Clamp((int)MathF.Ceiling(MathF.Sqrt(glyphCount)), 2, 4);
        var rows = (int)MathF.Ceiling(glyphCount / (float)columns);
        var cellWidth = AlienAnswerGenerator.ImageSize / (float)(columns + 1);
        var cellHeight = AlienAnswerGenerator.ImageSize / (float)(rows + 1);

        for (var i = 0; i < glyphIndices.Count; i++)
        {
            var row = i / columns;
            var col = i % columns;
            var center = new PointF(
                cellWidth * (col + 1),
                cellHeight * (row + 1));
            var size = MathF.Min(cellWidth, cellHeight) * (0.55f + random.NextSingle() * 0.2f);
            var rotation = random.NextSingle() * 360f;

            image.Mutate(ctx => AlienGlyphs.Draw(ctx, glyphIndices[i], center, size, rotation));
        }

        using var stream = new MemoryStream();
        image.Save(stream, new PngEncoder());
        return stream.ToArray();
    }
}
