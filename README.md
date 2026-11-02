# ToDo Playwright assessment

Risk-based Chromium coverage for the [Cypress Kitchen Sink ToDo application](https://github.com/cypress-io/cypress-example-kitchensink), using Playwright Test, strict TypeScript, one page object and Allure 2. The application and automation remain separate repositories. Existing Cypress examples are excluded.

Application source pinned in Docker: `dca70562c010156b05cc8b54e641f67c0063d5dc`. Tests cover the implementation at that commit, including its initial sample tasks.

**Status:** local execution and GitHub-hosted Docker test execution have passed. Allure is published on GitHub Pages, with history/trends confirmed across three CI runs. QA-001 is published as a GitHub issue. See the [validation and PDF audit](docs/ASSESSMENT_AUDIT.md) for evidence and remaining limits: local Docker Desktop execution and a controlled failing hosted CI run remain unverified. One confirmed product bug is deliberately represented by an expected-failure regression; a green suite does not mean the product is defect-free.

- [GitHub repository](https://github.com/andjeloed/todo-playwright-automation)
- [Published Allure report](https://andjeloed.github.io/todo-playwright-automation/)
- [QA-001: published product issue](https://github.com/andjeloed/todo-playwright-automation/issues/1)
- [GitHub Actions runs](https://github.com/andjeloed/todo-playwright-automation/actions)

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
docs/issues/QA-001.md              Local record of published GitHub issue #1
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

Inside the interactive shell: `npm run typecheck`, `npm start --prefix /opt/kitchensink`, or `npx playwright test` (with the appropriate `START_APP` setting). Image build, application startup and tests have succeeded on GitHub-hosted Linux CI. Local Docker Desktop execution remains unverified because its Linux engine could not start. Container cancellation and startup-failure paths have not been exercised.

## GitHub Actions and reviewer access

The workflow runs on main pushes, pull requests and manual dispatch. It builds and runs the Docker image; captures the container exit code; restores history; generates reports even after test failure; uploads results, reports, logs and failure evidence for 30 days; and finally propagates test failure. Build/report/publication errors also fail their jobs. No `continue-on-error` is used.

For trusted main runs, a separate publication job commits the generated report/history to `gh-pages` and deploys the report using official Pages actions. PRs get downloadable artifacts, including fork PRs, and never receive publication permissions. The test job has read-only contents permission; only the main publication job has contents/Pages write and OIDC permissions. No extra secret is required.

The repository, [issue #1](https://github.com/andjeloed/todo-playwright-automation/issues/1) and [Allure report](https://andjeloed.github.io/todo-playwright-automation/) are published. User-provided screenshots show successful `test` and `publish` jobs and Allure trend entries for runs #1, #2 and #3, each with 15 expected passing outcomes.

Before submission, confirm that the intended reviewers can open all three links; invite them if repository access requires it. A controlled failing hosted CI run remains a follow-up check: verify it concludes failed while still uploading evidence and publishing its report. Failure evidence, nonzero exits and flaky-test rejection have been verified locally.

For a fresh repository, enable Actions, permit generated `gh-pages` commits, select **Settings → Pages → GitHub Actions**, and allow the `github-pages` environment to deploy from main. Run the workflow twice and confirm history is retained. The existing repository has already completed the successful execution/publication/history checks.

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

The user has committed and pushed the implementation and published the issue. These Conventional Commit groupings are examples for future reviewable changes; they do not describe a fabricated commit history:

1. `chore: configure Playwright and strict TypeScript`
2. `test: cover todo workflows filtering persistence and input edges`
3. `test: reproduce duplicate sample task ids`
4. `build: add pinned application and Docker execution`
5. `ci: publish Allure reports with persistent history`
6. `docs: document test approach findings and assessment audit`

With more time: fix and retest QA-001 upstream, add task control accessible names, confirm empty-state requirements, add Firefox/WebKit coverage, pin container/action references by digest/SHA under an update policy, and validate cancellation/startup failure paths in Docker. Also exercise a controlled failing hosted CI run; successful hosted execution and three-run history have already been confirmed.
