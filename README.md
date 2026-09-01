# Running & Testing the Backend

The API project lives at `EnterpriseQuestionCanvas/backend/src/QuestionCanvas.Api`. Run all commands from that project folder (the one containing `QuestionCanvas.Api.csproj` and `Properties/launchSettings.json`).

## Run the API

Change into the project directory:

```bash
cd EnterpriseQuestionCanvas/backend/src/QuestionCanvas.Api
```

Then start the API using the `https` launch profile so it binds to HTTPS on port 7043:

```bash
dotnet run --launch-profile https
```

The `https` profile listens on `https://localhost:7043` and `http://localhost:5043`. `dotnet run` blocks the terminal while the server is running, so leave it running and open a second terminal for the test commands below. Stop the server with Ctrl+C.

You can also run it from the repository root by pointing at the project explicitly:

```bash
dotnet run --project EnterpriseQuestionCanvas/backend/src/QuestionCanvas.Api --launch-profile https
```

## Test the health endpoints

The `-k` flag tells curl to accept the local development (self-signed) certificate.

**macOS/Linux**

```bash
curl -k https://localhost:7043/health/live
curl -k https://localhost:7043/health/ready
```

**Windows**

```powershell
curl.exe -k https://localhost:7043/health/live
curl.exe -k https://localhost:7043/health/ready
```

If you get `curl: (7) Failed to connect`, the server either isn't running or was started under the `http` profile (port 5175) instead of `https` (port 7043). Make sure you launched it with `--launch-profile https`.

# alien8ball
.net 10 enterprise api backend with a react front end
