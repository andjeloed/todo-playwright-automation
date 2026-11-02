# Assessment audit and validation record

Date: 2026-11-02. Source: the complete two-page **Senior QA Automation Engineer — Practical Exercise** PDF supplied by the user.

- [Published repository](https://github.com/andjeloed/todo-playwright-automation)
- [Published Allure report](https://andjeloed.github.io/todo-playwright-automation/)
- [Published issue #1](https://github.com/andjeloed/todo-playwright-automation/issues/1)
- [GitHub Actions](https://github.com/andjeloed/todo-playwright-automation/actions), including the [first successful run](https://github.com/andjeloed/todo-playwright-automation/actions/runs/41496038956)

Hosted validation below is based on the user's successful Actions/Allure screenshots and confirmation of issue publication with uploaded evidence. The Allure screenshot shows trend entries #1, #2 and #3, each with 15 expected passing outcomes. These observations establish successful hosted execution/publication and cross-run trends; they do not establish a controlled failing hosted execution or reviewer-specific permissions. The remote issue/report could not be independently fetched through the agent's browsing tool during this documentation update.

## Independent review update

The complete implementation and PDF were reviewed again without assuming earlier results established correctness. See [review findings, fixes and interview decisions](CODE_REVIEW.md).

Confirmed reporting problems were fixed: empty reports are rejected, missing/corrupt requested history fails generation, and CI cannot publish after history restoration fails. CI now rejects flaky passes despite retaining a diagnostic retry. Baseline/filter/edit assertions were strengthened. QA-002 was corrected using the browser accessibility tree: the checkbox is unnamed, while delete is named “×” through CSS rather than being entirely unnamed.

Revalidation after these changes: **45 passed** with four workers/three repetitions/zero retries (57.2 s); **15 passed** in CI mode with two workers (15.1 s). Both totals include the acknowledged product-failure regression. A fail-then-pass probe returned **1 flaky, exit 1**; missing/empty results and missing/corrupt history were each rejected with **exit 1**. The deliberate browser failure still generated screenshot, video and trace attachments. TypeScript and revised-workflow actionlint checks passed. Revised report generation preserved two executions for all 15 ordinary-run test histories and two trend entries. Local bare-repository simulation verified initial/subsequent report-branch publication and independent history retrieval, without contacting GitHub.

Local Docker Desktop previously reported **“Docker Desktop is unable to start.”** Local container execution remains unverified, but image build, application startup, tests and report generation have since succeeded on GitHub-hosted Linux CI. Repository, issue and Pages publication are complete, and three-run hosted trends are confirmed. Hosted failure-path checks and reviewer-specific access remain outstanding.

## Actual validation

| Check | Result and evidence |
| --- | --- |
| Access and source inspection | Both projects and the complete PDF were accessible. App commit `dca70562c010156b05cc8b54e641f67c0063d5dc` inspected. |
| Local app | Started existing `npm start`; `/todo` returned HTTP 200. Browser interactions verified actual behaviour. |
| Strict TypeScript | `npm run typecheck` passed, including final configuration. |
| Repeated parallel tests | `npx playwright test --workers=4 --repeat-each=3 --retries=0`: **45 passed**, 58.1 s. Includes three acknowledged expected-failure defect reproductions. |
| Independent two-worker runs | Two separate executions with `--workers=2 --retries=0`: **15 passed**, 16.9 s and **15 passed**, 17.5 s. The final run includes screenshot/saved-state attachments for QA-001. |
| Failure pipeline | Temporary ignored test deliberately asserted 999 tasks against 2. It failed with **exit 1**. Allure raw JSON had `failed` status and referenced existing screenshot, video, error-context and trace attachments. Probe excluded from submitted suite. |
| Allure generation | Java 21 + locked Allure command line generated reports successfully, including final `allure-report/index.html`. |
| Local history | Two independent raw result sets and reports; second report has **2 trend entries**, **15 test histories**, each with **2 executions**. Verified JSON contents; this is not cross-CI verification. |
| Workflow syntax | Official `actionlint` **1.7.12** returned exit 0 for `.github/workflows/playwright.yml`. This validates syntax/expressions, not hosted execution. |
| Shell syntax | Git Bash `bash -n scripts/container-test.sh` returned exit 0. |
| Docker build/run | Successful GitHub-hosted test jobs establish image construction, dependency installation, application startup and suite execution. Local Docker Desktop could not start. Cancellation/startup-failure lifecycle checks remain unverified. |
| Hosted CI and Pages | User screenshots show successful `test` and `publish` jobs, two downloadable artifacts, and the live Allure report with 15 expected passing outcomes. |
| Hosted history/trends | User's published report screenshot shows run entries #1, #2 and #3. Persistence across separate CI runs is verified; individual hosted test History tabs were not independently inspected. |
| Published issue | User confirmed [issue #1](https://github.com/andjeloed/todo-playwright-automation/issues/1) was created using the supplied complete issue text and screenshot evidence. |
| Git/repository hygiene | Generated directories and local workspace file ignored; lockfile included. The user committed/pushed the automation repository and configured `origin`. App had a pre-existing `package-lock.json` modification at first inspection; it was left untouched. |
| Product findings | QA-001 reproduced in a real browser, with duplicate IDs and incorrect saved completion state; QA-002 control markup inspected; QA-003 empty reload/reseeding reproduced. |

“15 passed” includes **14 normal passes and one expected product failure**. Playwright and Allure classify the acknowledged expected failure as passed. Its name, annotation and explicit screenshot/state/ID attachments preserve its meaning. It does not represent a product fix. Setup errors occur before the expected-failure marker so they cannot be silently accepted. If the defect stops reproducing, the unexpected pass fails execution.

Initial investigation runs failed because of the product's duplicate seed IDs and the automation's bulk/filtered checkbox interaction choices. The final suite replaces seed tasks through UI setup, clicks the bulk control's visible label and uses clicks for filter-replaced checkboxes. Business assertions were preserved. No product source was changed.

## Every PDF requirement

The statuses below apply to the actual deliverable, not merely the existence of a file. Repeated PDF requirements are cross-referenced to the same implementation.

| PDF requirement | Status | Evidence or remaining work |
| --- | --- | --- |
| Use Kitchen Sink ToDo only, excluding existing Cypress examples | Implemented and verified | Inspected `/todo` and its JavaScript; submission contains only Playwright automation. |
| Required framework: Playwright with TypeScript | Implemented and verified | Strict type checking and executed specs. |
| Analyse application and select meaningful tests | Implemented and verified | `TEST_APPROACH.md`, source/runtime inspection, verified findings and coverage. |
| Concise test approach: priorities, assumptions, scope, exclusions | Implemented and verified | `TEST_APPROACH.md`. |
| Implement selected automated tests | Implemented and verified | 15 tests, 14 ordinary scenarios plus acknowledged defect regression. |
| Repeated reliable execution, ideally parallel | Implemented and verified | 45-execution, four-worker, zero-retry run; independent two-worker runs. |
| Build a Docker image containing application, tests and dependencies | Implemented and verified | GitHub-hosted test job successfully builds and executes the image with pinned app, dependencies and tests. Local Docker Desktop execution remains unverified. |
| GitHub Actions workflow runs assessment suite | Implemented and verified | Successful hosted `test` jobs and published report with 15 expected passing outcomes. |
| Reporting other than Playwright default HTML | Implemented and verified | Allure 2 reporter and generated report; no Playwright HTML reporter. |
| Understandable results, steps and failures | Implemented and verified | Named tests and `test.step`; generated Allure data includes action/assertion details and failure messages. |
| Useful failure evidence | Implemented and verified | Deliberate failure returned 1; screenshot/video/trace attachments verified in raw Allure data. |
| Preserve execution history | Implemented and verified | Local per-test history transfer and published trends across hosted runs #1, #2 and #3. |
| Review trends over multiple executions | Implemented and verified | User's live Allure Overview screenshot shows three hosted run entries. Reviewer-specific access still needs confirmation. |
| Generate reporting from CI | Implemented and verified | Successful hosted report generation and 15-test Allure report. Failure publication is implemented but not yet exercised in hosted CI. |
| Make report available from CI | Implemented and verified | Artifacts and Pages publication succeeded; live report screenshot supplied by the user. |
| Explain reporting choice | Implemented and verified | `TEST_APPROACH.md` explains Allure readability, attachments and history transfer. |
| Document defects, unclear behaviour or testability concerns | Implemented and verified | `FINDINGS.md`: verified ID defect, unnamed checkbox/non-descriptive delete name, empty-list clarification. |
| Create at least one well-structured GitHub issue | Implemented and verified | User-confirmed published issue #1 with uploaded screenshot; local issue record aligned with the supplied published text. |
| Issue gives enough detail to understand/reproduce/prioritise | Implemented and verified | Published text includes environment, preconditions, timing condition, deterministic reproduction, expected/actual, impact, evidence and acceptance criteria. |
| Deliver GitHub repository link and reviewer access | Partially implemented | Repository URL is published; reviewer-specific access has not been confirmed. |
| Deliver setup/execution instructions | Implemented and verified | `README.md` provides local/Docker/CI/reporting commands and distinguishes hosted success from local Docker limitations. |
| Deliver concise approach and technical decisions | Implemented and verified | `TEST_APPROACH.md`, README architecture and reporting rationale. |
| Deliver Playwright TypeScript suite | Implemented and verified | Typed POM, built-in fixture, 15 specs' scenarios, executed in parallel. |
| Deliver a working GitHub Actions workflow | Implemented and verified | Static checks and successful hosted test/publication jobs; controlled hosted failure paths remain additional validation. |
| Deliver at least one documented product-quality/testability finding | Implemented and verified | `FINDINGS.md` and evidence screenshot. |
| Short note on improvements with more time | Implemented and verified | README and `TEST_APPROACH.md`. |

## Remaining submission gates

1. Confirm intended reviewers can access the repository, issue and report; grant access if needed. This is the remaining unconfirmed PDF submission requirement.
2. Commit/push the updated documentation and share the three published links with reviewers. Confirm the resulting workflow succeeds.
3. As additional reliability validation, exercise a controlled failing hosted CI run: verify it concludes failed while uploading evidence and publishing the report. Local failure evidence, nonzero exits, report guards and flaky rejection have passed; hosted failure publication is still unverified.
4. Optional environment/lifecycle follow-up: restore local Docker Desktop and exercise container cancellation/startup-failure handling. Successful hosted image build/run already provides the assessment's Docker execution evidence; it does not prove these additional paths.
