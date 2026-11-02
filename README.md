# ToDo Playwright assessment

Risk-based Chromium coverage for the [Cypress Kitchen Sink ToDo application](https://github.com/cypress-io/cypress-example-kitchensink), using Playwright Test, strict TypeScript, one page object and Allure 2. The application and automation remain separate repositories. Existing Cypress examples are excluded.

Application source pinned in Docker: `dca70562c010156b05cc8b54e641f67c0063d5dc`. Tests cover the implementation at that commit, including its initial sample tasks.

**Status:** see [validation and PDF audit](docs/ASSESSMENT_AUDIT.md). Local execution is verified. Docker execution and GitHub publication require the remaining environment/setup steps. One confirmed product bug is deliberately represented by an expected-failure regression; a green suite does not mean the product is defect-free.

See the [independent implementation review](docs/CODE_REVIEW.md) for confirmed issues fixed, revalidation, unresolved gaps and five technical decisions to defend in an interview.

## Structure

```text
.github/workflows/playwright.yml   Docker tests, artifacts, history, Pages
pages/TodoPage.ts                  Locators and user actions
tests/fixtures.ts                  Isolated, UI-created baseline
tests/todo-crud.spec.ts            Creation, edit, delete, input edges
tests/todo-status.spec.ts          Completion, counts, clear, empty state
tests/todo-filters.spec.ts         Mixed states and live filtering
tests/todo-persistence.spec.ts     CRUD/status/filter persistence
tests/todo-known-defect.spec.ts    QA-001 expected-failure regression
scripts/                          Container execution, result cleanup, reports
docs/issues/QA-001.md              Unpublished GitHub issue draft
docs/evidence/QA-001.png           Verified product finding
docs/ASSESSMENT_AUDIT.md           Actual validation and requirement audit
Dockerfile / .dockerignore         Independent application retrieval
playwright.config.ts              Environment-aware execution and evidence
tsconfig.json                     Strict, no-emit type checking
package.json / package-lock.json   Pinned dependencies
TEST_APPROACH.md / FINDINGS.md     Decisions, coverage and observations
```

## Prerequisites and installation

Use Node 24 LTS (local validation used 24.13.0), npm, Git, and Java 17+ for local Allure generation. Docker Desktop must use Linux containers for the Docker route. Java and browsers are included in the image.

From the automation repository:

```powershell
npm ci
npx playwright install chromium
```

Skip these installations if the existing dependencies and browser already match the lockfile. The Playwright package and official Docker browser image both use **1.64.1**; update them together, as required by [Playwright's Docker guidance](https://playwright.dev/docs/docker).

## Start the local application

In a separate terminal, navigate to your existing application checkout, verify the commit if you need reproducibility, and run:

```powershell
git rev-parse HEAD
npm start
```

For a fresh application checkout anywhere outside this automation repository:

```powershell
git clone https://github.com/cypress-io/cypress-example-kitchensink.git
cd cypress-example-kitchensink
git checkout dca70562c010156b05cc8b54e641f67c0063d5dc
$env:CYPRESS_INSTALL_BINARY='0'
npm ci
npm start
```

The application's declared Node engine may require a newer Node 24 patch than the local one used here. Use its supported engine when installing a fresh checkout. Open `http://localhost:8080/todo`. Local tests expect the server to be running and do not launch another instance.

## Execute locally

Run from the automation repository:

```powershell
npm run typecheck
npm test
npm test -- tests/todo-crud.spec.ts
npm test -- --grep 'P0 deletes'
npm test -- --headed
npm test -- --debug
npm test -- --workers=4 --repeat-each=3 --retries=0
```

`npm test` removes old raw Allure results before running. Direct `npx playwright test` does not invoke that cleanup; run `node scripts/clean-results.mjs` first when you need one clean execution report. Generated reports remain available until regenerated.

Optional PowerShell environment overrides:

```powershell
$env:BASE_URL='http://localhost:8080'
$env:OUTPUT_DIR='artifacts'
npm test
Remove-Item Env:BASE_URL, Env:OUTPUT_DIR
```

`BASE_URL` is the server origin; the page object navigates to `/todo`. `OUTPUT_DIR` relocates raw results and Playwright evidence. `START_APP=1` is reserved for the container's `/opt/kitchensink` installation. CI uses two workers and one diagnostic retry. `failOnFlakyTests` makes a pass on retry fail the CI gate too; repeat validation uses zero retries to reveal instability.

## Allure reports

```powershell
npm run report:generate
npm run report:open
```

For a custom output directory, set `OUTPUT_DIR` for generation too; open it with `npx allure open artifacts/allure-report`. Serve reports over HTTP using Allure; opening `index.html` directly can prevent data loading.

Allure includes meaningful action steps, assertions and diagnostic attachments. Unexpected failures retain screenshots, videos and traces, attached by `allure-playwright` and also present under `test-results`. View a downloaded trace using `npx playwright show-trace <path-to-trace.zip>`.

To verify local history across two independent executions:

```powershell
$env:OUTPUT_DIR='artifacts/run-1'
npm test
npm run report:generate
$env:HISTORY_DIR='artifacts/run-1/allure-report'
$env:OUTPUT_DIR='artifacts/run-2'
npm test
npm run report:generate
npx allure open artifacts/run-2/allure-report
Remove-Item Env:HISTORY_DIR, Env:OUTPUT_DIR
```

`HISTORY_DIR` points to a previous report containing `history/`. [Allure 2 history](https://allurereport.org/docs/history-and-retries/) must be copied into new results before generation; merely installing the reporter does not preserve trends. CI performs this transfer automatically.

Report generation rejects missing/empty raw results and missing or corrupt explicitly requested history. This avoids publishing an empty success report or silently discarding history. `--repeat-each` adds an Allure Repetition parameter and separate history identities; compare ordinary executions with the same parameters when validating per-test history, and keep stress-run outputs separate.

## Docker

From the automation repository, with Docker Desktop running:

```powershell
docker build -t todo-assessment .
New-Item -ItemType Directory -Force artifacts | Out-Null
docker run --rm --init --ipc=host --mount "type=bind,source=$((Get-Location).Path)\artifacts,target=/artifacts" todo-assessment
$testExit = $LASTEXITCODE
docker run --rm --init --mount "type=bind,source=$((Get-Location).Path)\artifacts,target=/artifacts" todo-assessment node scripts/report.mjs
npx allure open artifacts/allure-report
Write-Output "Test exit code: $testExit"
```

Use a fresh output directory per run if you need to retain older evidence. On Linux, replace the mount argument with `-v "$PWD/artifacts:/artifacts"`. The image retrieves the upstream repository by immutable commit, installs its production dependencies using its lockfile and `--ignore-scripts` (no Cypress/husky needed), and installs the automation using `npm ci`. It contains application assets and the upstream licence. No local application folder or absolute Windows path is used.

Playwright's `webServer` starts `npm start`, waits for `/todo`, rejects an existing server, and terminates the process group after execution. The shell entry command uses `exec`, preserving test errors and signals; `--init` reaps orphan processes. `/artifacts` contains raw Allure results and failure evidence. Report generation is a separate invocation so it can run even after failed tests. In scripts, return the saved test exit code after reporting rather than the report command's code.

Debug the image or run a subset:

```powershell
docker run --rm --init -it todo-assessment bash
docker run --rm --init --ipc=host todo-assessment sh scripts/container-test.sh --grep 'P0 deletes'
```

Inside the interactive shell: `npm run typecheck`, `npm start --prefix /opt/kitchensink`, or `npx playwright test` (with the appropriate `START_APP` setting). Docker generation and execution remain unverified while the Linux daemon is unavailable.

## GitHub Actions and reviewer access

The workflow runs on main pushes, pull requests and manual dispatch. It builds and runs the Docker image; captures the container exit code; restores history; generates reports even after test failure; uploads results, reports, logs and failure evidence for 30 days; and finally propagates test failure. Build/report/publication errors also fail their jobs. No `continue-on-error` is used.

For trusted main runs, a separate publication job commits the generated report/history to `gh-pages` and deploys the report using official Pages actions. PRs get downloadable artifacts, including fork PRs, and never receive publication permissions. The test job has read-only contents permission; only the main publication job has contents/Pages write and OIDC permissions. No extra secret is required.

Before submission:

1. Create the automation GitHub repository and grant reviewers access. Add its remote and push only when you are ready; nothing has been published by this implementation.
2. Enable Actions and the maintained official actions used by the workflow. Permit the publication job to write `gh-pages`; branch rules must allow the bot's generated report commits.
3. Under **Settings → Pages**, choose **GitHub Actions** as the deployment source. Allow the `github-pages` environment to deploy from main; approve any environment protection prompt.
4. Run the workflow on main. Download `assessment-results`; inspect the report, steps and evidence. The Pages deployment/environment supplies the actual report URL, normally `https://<owner>.github.io/<repository>/`.
5. Run it again on main. Confirm `gh-pages/history` survives and the second report has two history-trend entries. Repository publication, CI execution and cross-CI history are not locally verified.
6. Publish [the issue draft](docs/issues/QA-001.md) after reviewing it, upload its screenshot, and record its real URL. Share the repository, issue and Pages links with reviewers.

All main executions are serialized across testing and publication to avoid history races. GitHub may replace older pending runs during bursts; history reflects executions that actually reach report publication. Failed tests still publish reports. The first run starts without history. Allure retains a rolling history window (normally 20 executions); `gh-pages` commits preserve prior report versions, while full failure evidence expires with artifact retention. Only main contributes to the published trend; PR history is not merged into it. Failed publication requires rerunning the workflow; no false claim of successful deployment is made.

Publication also requires successful history restoration. A restore/authentication/archive failure leaves the previous published report and history intact while the workflow fails; diagnostic artifacts are still collected.

## Troubleshooting and limitations

- Connection refused: start the application and confirm `/todo` responds on port 8080; check `BASE_URL` and unset container-only `START_APP` locally.
- Browser executable missing: run `npx playwright install chromium` for the locked package version.
- `spawn EPERM` in a restricted agent environment: worker/browser process launch needs the environment's approval. It is not an application failure.
- Docker pipe/daemon error: start Docker Desktop with Linux containers, wait for `docker info` to succeed, then rebuild.
- Java not found: install a supported JRE/JDK and configure `JAVA_HOME`, or generate the report in Docker.
- Port occupied in Docker: `webServer` intentionally rejects a pre-existing server; inspect custom startup commands/overrides.
- Unexpected pass of QA-001: investigate the application fix and remove the expected-failure marker once confirmed. The deterministic regression covers a real collision condition even on systems where natural collisions are intermittent.
- Sample tasks reappear after empty-list reload; this needs product clarification. See [findings](FINDINGS.md).
- Chromium desktop only. Cross-browser, performance, comprehensive accessibility and multitab sync are outside this assessment's automated scope.

## Suggested commits and further work

No commits, remote creation, push or issue publication have been performed. Suggested Conventional Commits, grouped by reviewable changes:

1. `chore: configure Playwright and strict TypeScript`
2. `test: cover todo workflows filtering persistence and input edges`
3. `test: reproduce duplicate sample task ids`
4. `build: add pinned application and Docker execution`
5. `ci: publish Allure reports with persistent history`
6. `docs: document test approach findings and assessment audit`

With more time: fix and retest QA-001 upstream, add task control accessible names, confirm empty-state requirements, add Firefox/WebKit coverage, pin container/action references by digest/SHA under an update policy, and validate cancellation/startup failure paths in Docker. Complete the pending Docker and two-run CI checks before claiming the assessment is fully verified.
