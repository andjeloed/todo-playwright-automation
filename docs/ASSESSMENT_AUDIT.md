# Assessment audit and validation record

Date: 2026-11-02. Source: the complete two-page **Senior QA Automation Engineer — Practical Exercise** PDF supplied by the user. No repository, issue or report has been published remotely.

## Independent review update

The complete implementation and PDF were reviewed again without assuming earlier results established correctness. See [review findings, fixes and interview decisions](CODE_REVIEW.md).

Confirmed reporting problems were fixed: empty reports are rejected, missing/corrupt requested history fails generation, and CI cannot publish after history restoration fails. CI now rejects flaky passes despite retaining a diagnostic retry. Baseline/filter/edit assertions were strengthened. QA-002 was corrected using the browser accessibility tree: the checkbox is unnamed, while delete is named “×” through CSS rather than being entirely unnamed.

Revalidation after these changes: **45 passed** with four workers/three repetitions/zero retries (57.2 s); **15 passed** in CI mode with two workers (15.1 s). Both totals include the acknowledged product-failure regression. A fail-then-pass probe returned **1 flaky, exit 1**; missing/empty results and missing/corrupt history were each rejected with **exit 1**. The deliberate browser failure still generated screenshot, video and trace attachments. TypeScript and revised-workflow actionlint checks passed. Revised report generation preserved two executions for all 15 ordinary-run test histories and two trend entries. Local bare-repository simulation verified initial/subsequent report-branch publication and independent history retrieval, without contacting GitHub.

Docker still reports **“Docker Desktop is unable to start.”** The Docker/hosted-CI/Pages/issue/repository publication statuses below remain incomplete. The original validation record is retained below; the review report distinguishes the additional local checks from still-unverified hosted execution.

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
| Docker build/run | Build attempted before and after attempting `docker desktop start`. Final build returned **“Docker Desktop is unable to start”**, exit 1. Container build, startup, teardown and test execution are unverified. |
| Git/repository hygiene | Generated directories and local workspace file ignored; lockfile included; no automation remote configured; no commits/push performed. App had a pre-existing `package-lock.json` modification at first inspection; it was left untouched. |
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
| Build a Docker image containing application, tests and dependencies | Implemented but unverified | Dockerfile retrieves pinned app and installs dependencies/browser image/Java. **No successful image build or run yet.** |
| GitHub Actions workflow runs assessment suite | Implemented but unverified | Workflow passes actionlint, builds/runs Docker; **no hosted run yet**. |
| Reporting other than Playwright default HTML | Implemented and verified | Allure 2 reporter and generated report; no Playwright HTML reporter. |
| Understandable results, steps and failures | Implemented and verified | Named tests and `test.step`; generated Allure data includes action/assertion details and failure messages. |
| Useful failure evidence | Implemented and verified | Deliberate failure returned 1; screenshot/video/trace attachments verified in raw Allure data. |
| Preserve execution history | Partially implemented | Two-run local transfer verified; persistent branch/CI transfer implemented, **not executed remotely**. |
| Review trends over multiple executions | Partially implemented | Local report has two trend entries and per-test histories; **reviewer access to hosted trends pending**. |
| Generate reporting from CI | Implemented but unverified | Container report step runs after test failure; **no hosted execution**. |
| Make report available from CI | Implemented but unverified | Artifact upload for PR/main and main Pages deployment configured; **no actual upload/deployment**. |
| Explain reporting choice | Implemented and verified | `TEST_APPROACH.md` explains Allure readability, attachments and history transfer. |
| Document defects, unclear behaviour or testability concerns | Implemented and verified | `FINDINGS.md`: verified ID defect, unnamed controls, empty-list clarification. |
| Create at least one well-structured GitHub issue | Partially implemented | Complete reproducible draft at `docs/issues/QA-001.md`; **not published, pending user's approval**. |
| Issue gives enough detail to understand/reproduce/prioritise | Implemented and verified | Draft includes environment, preconditions, timing condition, deterministic reproduction, expected/actual, impact, evidence and acceptance criteria. |
| Deliver GitHub repository link and reviewer access | Not implemented | **Repository remains local; user must create/push and grant access.** |
| Deliver setup/execution instructions | Implemented and verified | `README.md` covers local execution and reporting commands actually executed; Docker/CI commands are clearly unverified. |
| Deliver concise approach and technical decisions | Implemented and verified | `TEST_APPROACH.md`, README architecture and reporting rationale. |
| Deliver Playwright TypeScript suite | Implemented and verified | Typed POM, built-in fixture, 15 specs' scenarios, executed in parallel. |
| Deliver a working GitHub Actions workflow | Implemented but unverified | Static validation passed; **working status requires a successful GitHub run**. |
| Deliver at least one documented product-quality/testability finding | Implemented and verified | `FINDINGS.md` and evidence screenshot. |
| Short note on improvements with more time | Implemented and verified | README and `TEST_APPROACH.md`. |

## Remaining submission gates

1. Start Docker Desktop's Linux engine. Build the image, execute it with an artifacts mount, generate its report and inspect exit status. Verify clean application checkout parity and server cleanup. A daemon failure cannot establish Docker correctness.
2. Create/push the GitHub repository and grant reviewers access when ready. This implementation has not created a remote or fabricated a commit history.
3. Enable Pages with GitHub Actions and allow main deployments/`gh-pages` writes. Run two main workflows; verify artifact collection, Pages access, saved history and trends across those separate runs. Also check a controlled failing CI run publishes evidence while the workflow concludes failed.
4. Review and publish QA-001 only with user approval; attach evidence and record the real issue URL.
5. Replace these pending statuses with observed results after validation. Share real repository, issue and report URLs. The local implementation is reviewable, but the full assessment is **not yet completely verified or submitted**.
