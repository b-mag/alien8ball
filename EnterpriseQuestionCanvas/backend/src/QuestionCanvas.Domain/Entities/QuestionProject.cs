namespace QuestionCanvas.Domain.Entities
{
    public class QuestionProject
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string NormalizedName { get; set; } = string.Empty;
        public string OwnerUserId { get; set; } = string.Empty;

        public DateTimeOffset CreatedUtc { get; set; } = DateTime.UtcNow;

        public List<QuestionEntry> Questions { get; set; } = [];
    }
}