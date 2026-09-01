using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace QuestionCanvas.Api.IntegrationTests;

internal static class TestAuthHelper
{
    public static async Task RegisterAndLoginAsync(HttpClient client, string email, string password)
    {
        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email,
            password,
        });
        registerResponse.EnsureSuccessStatusCode();

        var loginResponse = await client.PostAsJsonAsync(
            "/api/auth/login?useCookies=true",
            new { email, password });
        loginResponse.EnsureSuccessStatusCode();
    }
}

public sealed class AnswerImageApiTests : IClassFixture<IntegrationTestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AnswerImageApiTests(IntegrationTestWebApplicationFactory factory)
    {
        _client = factory.CreateAuthenticatedClient();
    }

    [Fact]
    public async Task AnswerImage_EndToEnd_ReturnsDeterministicPng()
    {
        var email = $"answer-image-{Guid.NewGuid():N}@example.com";
        const string password = "Str0ng!Passw0rd";

        await TestAuthHelper.RegisterAndLoginAsync(_client, email, password);

        var createProjectResponse = await _client.PostAsJsonAsync(
            "/api/projects",
            new { projectName = "Integration Session" });
        createProjectResponse.EnsureSuccessStatusCode();

        var projectJson = await createProjectResponse.Content.ReadFromJsonAsync<JsonElement>();
        var projectId = projectJson.GetProperty("id").GetGuid();

        var addQuestionResponse = await _client.PostAsJsonAsync(
            $"/api/projects/{projectId}/questions",
            new { question = "Will the integration test pass?" });
        addQuestionResponse.EnsureSuccessStatusCode();

        var questionJson = await addQuestionResponse.Content.ReadFromJsonAsync<JsonElement>();
        var questionId = questionJson.GetProperty("id").GetGuid();

        var firstResponse = await _client.GetAsync(
            $"/api/projects/{projectId}/questions/{questionId}/answer-image");
        firstResponse.EnsureSuccessStatusCode();
        Assert.Equal("image/png", firstResponse.Content.Headers.ContentType?.MediaType);

        var firstBytes = await firstResponse.Content.ReadAsByteArrayAsync();
        Assert.NotEmpty(firstBytes);
        Assert.Equal(0x89, firstBytes[0]);

        var secondResponse = await _client.GetAsync(
            $"/api/projects/{projectId}/questions/{questionId}/answer-image");
        secondResponse.EnsureSuccessStatusCode();
        var secondBytes = await secondResponse.Content.ReadAsByteArrayAsync();

        Assert.Equal(firstBytes, secondBytes);
    }

    [Fact]
    public async Task AnswerImage_WithoutAuthentication_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync(
            $"/api/projects/{Guid.NewGuid()}/questions/{Guid.NewGuid()}/answer-image");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AnswerImage_UnknownQuestion_ReturnsNotFound()
    {
        var email = $"answer-image-404-{Guid.NewGuid():N}@example.com";
        const string password = "Str0ng!Passw0rd";

        await TestAuthHelper.RegisterAndLoginAsync(_client, email, password);

        var createProjectResponse = await _client.PostAsJsonAsync(
            "/api/projects",
            new { projectName = "Missing Question Session" });
        createProjectResponse.EnsureSuccessStatusCode();

        var projectJson = await createProjectResponse.Content.ReadFromJsonAsync<JsonElement>();
        var projectId = projectJson.GetProperty("id").GetGuid();

        var response = await _client.GetAsync(
            $"/api/projects/{projectId}/questions/{Guid.NewGuid()}/answer-image");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
