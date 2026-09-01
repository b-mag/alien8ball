using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using QuestionCanvas.Application.Exceptions;
using SQLitePCL;

namespace QuestionCanvas.Api.Errors;

public sealed class GlobalExceptionHandler(IProblemDetailsService problemDetailsService, ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, title) = exception switch
        {
            AppValidationException =>
            (StatusCodes.Status400BadRequest, "Validation error"),
            NotFoundException =>
            (StatusCodes.Status404NotFound, "Resource not found"),
            ConflictException =>
            (StatusCodes.Status409Conflict, "Conflict error"),
            _ => (StatusCodes.Status500InternalServerError, "Server error")
        };

        if (status >= 500)
        {
            logger.LogError(exception,
            "Unhandled exception. TraceId: {TraceId}", httpContext.TraceIdentifier);
        }
        else
        {
            logger.LogWarning(exception,
            "Request failed with status {StatusCode}. TraceId: {TraceId}", status, httpContext.TraceIdentifier);
        }

        httpContext.Response.StatusCode = status;

        //Information disclosure: The 500 response does not return the exception message or stack trace. Detailed 
        //    exceptions belong in server logs, not in production API responses.

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = status >= 500
                ? "An unexpected error occurred."
                : exception.Message,
            Instance = httpContext.Request.Path
        };

        problem.Extensions["traceId"] = httpContext.TraceIdentifier;

        await problemDetailsService.WriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problem,
            Exception = exception
        });

        return true;
    }

}