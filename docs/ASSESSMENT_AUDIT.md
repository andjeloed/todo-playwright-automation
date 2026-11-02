# Assessment audit and validation record

Date: 2026-11-02. Source: the complete two-page **Senior QA Automation Engineer — Practical Exercise** PDF supplied by the user.

- [Published repository](https://github.com/andjeloed/todo-playwright-automation)
- [Published Allure report](https://andjeloed.github.io/todo-playwright-automation/)
- [Published issue #1](https://github.com/andjeloed/todo-playwright-automation/issues/1)
- [GitHub Actions](https://github.com/andjeloed/todo-playwright-automation/actions), including [successful final-commit run #4](https://github.com/andjeloed/todo-playwright-automation/actions/runs/41509592502)

Final audit independently verified the public GitHub API and published Allure JSON without authentication. The public `main` commit matches local `2fe1b5e9eec04b71df4df39a1763cb40bbd7be7b`. Run #4 succeeded, including image construction, suite execution, history restoration, report generation, artifact upload, report-branch update and Pages deployment. Both `assessment-results` and `github-pages` artifacts exist and are unexpired. Issue #1 is open and contains reproduction steps and an uploaded image. The report has 15 expected passing outcomes, four trend entries and four executions for each of 15 test histories. Its task-ID, screenshot, saved-state and error-context attachments return HTTP 200. The repository, issue and report are publicly readable, satisfying reviewer read access without invitations.

The original two-page PDF was re-read in full for this final audit. All mandatory PDF requirements are implemented and verified with the evidence described below. Local Docker Desktop, a controlled failing hosted workflow, and container cancellation/startup-failure paths remain unverified; these are additional validation limits, not separate mandatory PDF deliverables. Share the three published URLs with reviewers to complete delivery.

## Independent review update

The complete implementation and PDF were reviewed again without assuming earlier results established correctness. See [review findings, fixes and interview decisions](CODE_REVIEW.md).

Confirmed reporting problems were fixed: empty reports are rejected, missing/corrupt requested history fails generation, and CI cannot publish after history restoration fails. CI now rejects flaky passes despite retaining a diagnostic retry. Baseline/filter/edit assertions were strengthened. QA-002 was corrected using the browser accessibility tree: the checkbox is unnamed, while delete is named “×” through CSS rather than being entirely unnamed.

Revalidation after these changes: **45 passed** with four workers/three repetitions/zero retries (57.2 s); **15 passed** in CI mode with two workers (15.1 s). Both totals include the acknowledged product-failure regression. A fail-then-pass probe returned **1 flaky, exit 1**; missing/empty results and missing/corrupt history were each rejected with **exit 1**. The deliberate browser failure still generated screenshot, video and trace attachments. TypeScript and revised-workflow actionlint checks passed. Revised report generation preserved two executions for all 15 ordinary-run test histories and two trend entries. Local bare-repository simulation verified initial/subsequent report-branch publication and independent history retrieval, without contacting GitHub.

Local Docker Desktop previously reported **“Docker Desktop is unable to start.”** Local container execution remains unverified, but image build, application startup, tests and report generation have since succeeded on GitHub-hosted Linux CI. Repository, issue and Pages publication are complete. Independent final checks confirm public read access and four stored hosted report executions. A controlled failing hosted execution remains an additional follow-up check.

## Actual validation

| Check | Result and evidence |
| --- | --- |
| Access and source inspection | Both projects and the complete PDF were accessible. App commit `dca70562c010156b05cc8b54e641f67c0063d5dc` inspected. |
| Local app | Started existing `npm start`; `/todo` returned HTTP 200. Browser interactions verified actual behaviour. |
| Strict TypeScript | `npm run typecheck` passed, including final configuration. |
| Final audit rerun | `--workers=4 --retries=0`: **15 passed in 23.8 s**. Results saved separately under ignored `.tmp/final-audit`; TypeScript and actionlint passed again. |
| Repeated parallel tests | `npx playwright test --workers=4 --repeat-each=3 --retries=0`: **45 passed**, 58.1 s. Includes three acknowledged expected-failure defect reproductions. |
| Independent two-worker runs | Two separate executions with `--workers=2 --retries=0`: **15 passed**, 16.9 s and **15 passed**, 17.5 s. The final run includes screenshot/saved-state attachments for QA-001. |
| Failure pipeline | Temporary ignored test deliberately asserted 999 tasks against 2. It failed with **exit 1**. Allure raw JSON had `failed` status and referenced existing screenshot, video, error-context and trace attachments. Probe excluded from submitted suite. |
| Allure generation | Java 21 + locked Allure command line generated reports successfully, including final `allure-report/index.html`. |
| Local history | Two independent raw result sets and reports; second report has **2 trend entries**, **15 test histories**, each with **2 executions**. Verified JSON contents; this is not cross-CI verification. |
| Workflow syntax | Official `actionlint` **1.7.12** returned exit 0 for `.github/workflows/playwright.yml`. This validates syntax/expressions, not hosted execution. |
| Shell syntax | Git Bash `bash -n scripts/container-test.sh` returned exit 0. |
| Docker build/run | Successful GitHub-hosted test jobs establish image construction, dependency installation, application startup and suite execution. Local Docker Desktop could not start. Cancellation/startup-failure lifecycle checks remain unverified. |
| Hosted CI and Pages | Public API confirms run #4 at the final commit succeeded with `test` and `publish`, including Docker build/run and deployment. Both report artifacts are present. Live report JSON shows 15 expected passing outcomes. |
| Hosted history/trends | Independent inspection of published `history-trend.json` and `history.json`: four trend entries and four executions for each of 15 tests. Run #2 is recorded as cancelled at workflow level; its stored report exists, so four history entries do not mean four successful workflow conclusions. Runs #1, #3 and #4 concluded successfully. |
| Published issue and read access | Public API confirms [issue #1](https://github.com/andjeloed/todo-playwright-automation/issues/1) is open with detailed reproduction and an uploaded image. Repository is public; report and diagnostic attachments are readable without authentication. |
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
| Review trends over multiple executions | Implemented and verified | Four independently verified published trend entries and four executions per test. Report is publicly readable. |
| Generate reporting from CI | Implemented and verified | Successful hosted report generation and 15-test Allure report. Failure publication is implemented but not yet exercised in hosted CI. |
| Make report available from CI | Implemented and verified | Artifacts and Pages publication succeeded; live report screenshot supplied by the user. |
| Explain reporting choice | Implemented and verified | `TEST_APPROACH.md` explains Allure readability, attachments and history transfer. |
| Document defects, unclear behaviour or testability concerns | Implemented and verified | `FINDINGS.md`: verified ID defect, unnamed checkbox/non-descriptive delete name, empty-list clarification. |
| Create at least one well-structured GitHub issue | Implemented and verified | Independently inspected public issue #1 with reproduction, expected/actual, impact, proposed improvement, acceptance criteria and uploaded screenshot. |
| Issue gives enough detail to understand/reproduce/prioritise | Implemented and verified | Published text includes environment, preconditions, timing condition, deterministic reproduction, expected/actual, impact, evidence and acceptance criteria. |
| Deliver GitHub repository link and reviewer access | Implemented and verified | Published repository is public and readable without authentication, as are issue/report. Provide these URLs in the final submission. |
| Deliver setup/execution instructions | Implemented and verified | `README.md` provides local/Docker/CI/reporting commands and distinguishes hosted success from local Docker limitations. |
| Deliver concise approach and technical decisions | Implemented and verified | `TEST_APPROACH.md`, README architecture and reporting rationale. |
| Deliver Playwright TypeScript suite | Implemented and verified | Typed POM, built-in fixture, 15 specs' scenarios, executed in parallel. |
| Deliver a working GitHub Actions workflow | Implemented and verified | Static checks and successful hosted test/publication jobs; controlled hosted failure paths remain additional validation. |
| Deliver at least one documented product-quality/testability finding | Implemented and verified | `FINDINGS.md` and evidence screenshot. |
| Short note on improvements with more time | Implemented and verified | README and `TEST_APPROACH.md`. |

## Final delivery and additional validation

1. Mandatory technical deliverables are satisfied. Share the repository, issue and report URLs with reviewers; public read access has been independently verified.
2. Commit/push this final audit update if it is to be included in the submission. No code or workflow changes were needed for the final audit.
3. As additional reliability validation, exercise a controlled failing hosted CI run: verify it concludes failed while uploading evidence and publishing the report. Local failure evidence, nonzero exits, report guards and flaky rejection have passed; hosted failure publication is still unverified.
4. Optional environment/lifecycle follow-up: restore local Docker Desktop and exercise container cancellation/startup-failure handling. Successful hosted image build/run already provides the assessment's Docker execution evidence; it does not prove these additional paths.
