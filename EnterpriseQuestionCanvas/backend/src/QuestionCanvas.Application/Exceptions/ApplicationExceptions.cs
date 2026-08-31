namespace QuestionCanvas.Application.Exceptions;

public sealed class AppValidationException(string message) : Exception(message);

public sealed class NotFoundException(string message) : Exception(message);

public sealed class ConflictException(string message) : Exception(message);
