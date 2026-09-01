using System.Security.Cryptography;
using System.Text;

namespace QuestionCanvas.Application.Services;

/// <summary>
/// Deterministic helpers for alien answer glyph selection and layout.
/// </summary>
public static class AlienAnswerGenerator
{
    public const int ImageSize = 512;
    public const int MinGlyphCount = 8;
    public const int MaxGlyphCount = 16;

    /// <summary>
    /// Derives a stable seed from the question identity and text.
    /// </summary>
    public static int DeriveSeed(Guid projectId, Guid questionId, string questionText)
    {
        var payload = $"{projectId:N}{questionId:N}{questionText}";
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
        return BitConverter.ToInt32(hash, 0);
    }

    /// <summary>
    /// Returns the number of glyphs (8–16) for a given seed.
    /// </summary>
    public static int GetGlyphCount(int seed) =>
        MinGlyphCount + (int)((uint)seed % (MaxGlyphCount - MinGlyphCount + 1));

    /// <summary>
    /// Selects glyph indices for the alien alphabet based on the seed.
    /// </summary>
    public static IReadOnlyList<int> SelectGlyphIndices(int seed, int glyphCount)
    {
        var random = new Random(seed);
        var indices = new int[glyphCount];
        for (var i = 0; i < glyphCount; i++)
        {
            indices[i] = random.Next(AlienGlyphs.Count);
        }

        return indices;
    }
}
