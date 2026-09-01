using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace QuestionCanvas.Api.IntegrationTests;

public sealed class BasicApiTests : IClassFixture<IntegrationTestWebApplicationFactory>
{
    private readonly HttpClient _client;

    public BasicApiTests(IntegrationTestWebApplicationFactory factory)
    {
        factory.EnsureDatabase();
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task LiveHealthEndpoint_ReturnsSuccess()
    {
        var response = await _client.GetAsync("/health/live");
        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task ProjectsEndpoint_WithoutAuthentication_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/projects");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
