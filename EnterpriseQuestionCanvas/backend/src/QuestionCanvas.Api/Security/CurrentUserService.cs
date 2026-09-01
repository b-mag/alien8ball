using System.Security.Claims;
using QuestionCanvas.Application.Security;

namespace QuestionCanvas.Api.Security;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string UserId => httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
    ?? throw new InvalidOperationException("User is not authenticated.");
}