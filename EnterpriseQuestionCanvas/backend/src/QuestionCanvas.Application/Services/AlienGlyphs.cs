using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.Processing;

namespace QuestionCanvas.Application.Services;

/// <summary>
/// Geometric alien glyph paths inspired by reported crop-circle symbols.
/// </summary>
internal static class AlienGlyphs
{
    public static int Count => Builders.Count;

    private static readonly IReadOnlyList<Action<IImageProcessingContext, PointF, float, float>> Builders =
    [
        DrawTriangle,
        DrawChevron,
        DrawCircle,
        DrawCross,
        DrawDiamond,
        DrawBar,
        DrawHook,
        DrawSpiral,
        DrawHexagon,
        DrawWave,
        DrawArrow,
        DrawDotRing,
    ];

    public static void Draw(
        IImageProcessingContext context,
        int glyphIndex,
        PointF center,
        float size,
        float rotationDegrees)
    {
        var index = ((glyphIndex % Builders.Count) + Builders.Count) % Builders.Count;
        context.SetGraphicsOptions(new GraphicsOptions { Antialias = true });
        Builders[index](context, center, size, rotationDegrees);
    }

    private static void DrawTriangle(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        var path = BuildPolygon(c, s, 3, rot);
        StrokePath(ctx, path, 2.5f);
    }

    private static void DrawChevron(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        var rad = rot * MathF.PI / 180f;
        var cos = MathF.Cos(rad);
        var sin = MathF.Sin(rad);
        var points = new[]
        {
            Rotate(c, -s * 0.6f, 0, cos, sin),
            Rotate(c, 0, -s * 0.4f, cos, sin),
            Rotate(c, s * 0.6f, 0, cos, sin),
        };
        StrokePath(ctx, new PathBuilder().AddLines(points).CloseFigure().Build(), 2.5f);
    }

    private static void DrawCircle(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        _ = rot;
        StrokePath(ctx, new EllipsePolygon(c.X, c.Y, s * 0.35f), 2.5f);
    }

    private static void DrawCross(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        var rad = rot * MathF.PI / 180f;
        var cos = MathF.Cos(rad);
        var sin = MathF.Sin(rad);
        var h1 = Rotate(c, -s * 0.4f, 0, cos, sin);
        var h2 = Rotate(c, s * 0.4f, 0, cos, sin);
        var v1 = Rotate(c, 0, -s * 0.4f, cos, sin);
        var v2 = Rotate(c, 0, s * 0.4f, cos, sin);
        StrokePath(ctx, new PathBuilder().AddLines([h1, h2]).Build(), 2.5f);
        StrokePath(ctx, new PathBuilder().AddLines([v1, v2]).Build(), 2.5f);
    }

    private static void DrawDiamond(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        var path = BuildPolygon(c, s * 0.9f, 4, rot + 45f);
        StrokePath(ctx, path, 2.5f);
    }

    private static void DrawBar(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        var rad = rot * MathF.PI / 180f;
        var cos = MathF.Cos(rad);
        var sin = MathF.Sin(rad);
        var p1 = Rotate(c, -s * 0.5f, 0, cos, sin);
        var p2 = Rotate(c, s * 0.5f, 0, cos, sin);
        StrokePath(ctx, new PathBuilder().AddLines([p1, p2]).Build(), 3f);
    }

    private static void DrawHook(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        var rad = rot * MathF.PI / 180f;
        var cos = MathF.Cos(rad);
        var sin = MathF.Sin(rad);
        var points = new[]
        {
            Rotate(c, -s * 0.3f, s * 0.2f, cos, sin),
            Rotate(c, 0, -s * 0.3f, cos, sin),
            Rotate(c, s * 0.35f, s * 0.15f, cos, sin),
        };
        StrokePath(ctx, new PathBuilder().AddLines(points).Build(), 2.5f);
    }

    private static void DrawSpiral(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        var rad = rot * MathF.PI / 180f;
        var cos = MathF.Cos(rad);
        var sin = MathF.Sin(rad);
        var points = new PointF[12];
        for (var i = 0; i < points.Length; i++)
        {
            var t = i / (float)(points.Length - 1);
            var angle = t * MathF.PI * 1.5f;
            var radius = s * 0.1f + s * 0.25f * t;
            var x = radius * MathF.Cos(angle);
            var y = radius * MathF.Sin(angle);
            points[i] = Rotate(c, x, y, cos, sin);
        }

        StrokePath(ctx, new PathBuilder().AddLines(points).Build(), 2f);
    }

    private static void DrawHexagon(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        var path = BuildPolygon(c, s * 0.85f, 6, rot);
        StrokePath(ctx, path, 2.5f);
    }

    private static void DrawWave(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        var rad = rot * MathF.PI / 180f;
        var cos = MathF.Cos(rad);
        var sin = MathF.Sin(rad);
        var points = new PointF[7];
        for (var i = 0; i < points.Length; i++)
        {
            var t = i / (float)(points.Length - 1);
            var x = -s * 0.45f + s * 0.9f * t;
            var y = MathF.Sin(t * MathF.PI * 2f) * s * 0.2f;
            points[i] = Rotate(c, x, y, cos, sin);
        }

        StrokePath(ctx, new PathBuilder().AddLines(points).Build(), 2f);
    }

    private static void DrawArrow(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        var rad = rot * MathF.PI / 180f;
        var cos = MathF.Cos(rad);
        var sin = MathF.Sin(rad);
        var points = new[]
        {
            Rotate(c, -s * 0.45f, 0, cos, sin),
            Rotate(c, s * 0.2f, 0, cos, sin),
            Rotate(c, s * 0.05f, -s * 0.2f, cos, sin),
            Rotate(c, s * 0.35f, 0, cos, sin),
            Rotate(c, s * 0.05f, s * 0.2f, cos, sin),
            Rotate(c, s * 0.2f, 0, cos, sin),
        };
        StrokePath(ctx, new PathBuilder().AddLines(points).CloseFigure().Build(), 2.5f);
    }

    private static void DrawDotRing(IImageProcessingContext ctx, PointF c, float s, float rot)
    {
        _ = rot;
        StrokePath(ctx, new EllipsePolygon(c.X, c.Y, s * 0.3f), +2f);
        for (var i = 0; i < 6; i++)
        {
            var angle = i * MathF.PI / 3f;
            var dot = new PointF(
                c.X + s * 0.22f * MathF.Cos(angle),
                c.Y + s * 0.22f * MathF.Sin(angle));
            ctx.Fill(GlowBrush(0.6f), new EllipsePolygon(dot.X, dot.Y, s * 0.04f));
        }
    }

    private static IPath BuildPolygon(PointF center, float size, int sides, float rotationDegrees)
    {
        var points = new PointF[sides];
        var rot = rotationDegrees * MathF.PI / 180f;
        for (var i = 0; i < sides; i++)
        {
            var angle = rot + i * 2f * MathF.PI / sides - MathF.PI / 2f;
            points[i] = new PointF(
                center.X + size * 0.35f * MathF.Cos(angle),
                center.Y + size * 0.35f * MathF.Sin(angle));
        }

        return new PathBuilder().AddLines(points).CloseFigure().Build();
    }

    private static PointF Rotate(PointF center, float x, float y, float cos, float sin) =>
        new(center.X + x * cos - y * sin, center.Y + x * sin + y * cos);

    private static void StrokePath(IImageProcessingContext ctx, IPath path, float width)
    {
        ctx.Draw(GlowBrush(0.35f), width * 2.5f, path);
        ctx.Draw(GlowBrush(1f), width, path);
    }

    private static Brush GlowBrush(float alpha) =>
        new SolidBrush(Color.FromRgba(57, 255, 20, (byte)(255 * alpha)));
}
