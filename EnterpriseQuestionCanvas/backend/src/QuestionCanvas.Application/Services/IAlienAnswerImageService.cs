namespace QuestionCanvas.Application.Services;

public interface IAlienAnswerImageService
{
    byte[] GenerateAnswerImage(Guid projectId, Guid questionId, string questionText);
}
