namespace QuestionCanvas.Domain.Entities
{
    public sealed class QuestionEntry
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ProjectId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string OwnerUserId { get; set; } = string.Empty;
        public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;

        public QuestionProject Project { get; set; } = null!;
    }
}