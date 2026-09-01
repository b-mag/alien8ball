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

I've added a bruno collection to verify after Part 1 of building the enterprise backend.  Just download/install bruno easy windows with elevated powershell: winget install Bruno.Bruno

In Bruno open the collection in api-tests folder.  Then setup some variables for whatever you are wanting to test.  Below shows me making up a new user/pw to register and setting the Url to run locally.  Test out the two health methods one checks if running and communication to server is good and the 'ready' will also check the DB -- you can do a register and login as well if you add the user/pw I mentioned into the variables.

<img width="1591" height="952" alt="var-with-test-password" src="https://github.com/user-attachments/assets/cb541acf-6e95-4947-81dc-1c9a3ceb2752" />

<img width="1270" height="826" alt="bruno-register-login" src="https://github.com/user-attachments/assets/59307121-f02d-486d-afa4-c26f4ff1dc6e" />

<img width="1880" height="502" alt="terminal_out_during_test_login" src="https://github.com/user-attachments/assets/a435fd11-94b8-4cd4-abb6-2b705cee58fd" />

Alright we are ready to move to Part 1 - Frontend.

Part 1 - React/Typescript front end complete:

Has login and once you login you can save/recall projects owned by the user - then submit questions.  

<img width="1535" height="1015" alt="part1_final_react" src="https://github.com/user-attachments/assets/1e1cd9f5-ee55-45f3-97e5-c789ba5e4433" />

Part 2 - turn the project into something fun - Alien transmission 'magic 8 ball' - currently pushed to feature/part2

<img width="1282" height="951" alt="part2_login" src="https://github.com/user-attachments/assets/eb6eb351-5459-4c8e-9ba7-f1c6976d037a" />

<img width="1892" height="946" alt="part2_question_transmission" src="https://github.com/user-attachments/assets/ddce2293-20a9-4d66-9395-a73253afd5ce" />

<img width="1840" height="986" alt="part2_alien_response" src="https://github.com/user-attachments/assets/fd3b5d39-6c6c-4c08-b497-d986f57df8f5" />




# alien8ball
.net 10 enterprise api backend with a react front end
