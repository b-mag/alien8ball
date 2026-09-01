using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

public sealed class BasicApiTests : IClassFixture<WebApplicationFactory<Program>>
{
     private readonly HttpClient _client;
    public BasicApiTests(WebApplicationFactory<Program> factory)
    {
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