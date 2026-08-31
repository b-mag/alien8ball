namespace QuestionCanvas.Application.Security;

public interface ICurrentUserService
{
    string UserId { get; }
}