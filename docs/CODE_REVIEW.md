# Independent implementation review

Reviewed on 2026-11-02 against the entire original two-page assignment PDF, all submitted source/configuration/documentation, the actual application source and browser behaviour. The requirement-by-requirement status remains in [the assessment audit](ASSESSMENT_AUDIT.md).

## Confirmed issues fixed

| Priority | Finding | Correction and validation |
| --- | --- | --- |
| High | Failed history restoration did not prevent publication. The next report could overwrite the persisted branch without old history. | Publication readiness now requires successful history restoration as well as generation. First-run absence remains valid. Workflow passes actionlint; live GitHub failure-path verification remains pending. |
| High | Allure generation accepted absent/empty results, allowing an empty report after startup or typecheck failure. | Script rejects missing/empty raw results before generation. Both negative cases returned exit 1. CI still uploads available logs/evidence and propagates failures. |
| Medium | Explicit missing history was silently ignored; corrupted history could be handed to Allure and lost. | Explicit history must exist; history JSON is parsed before copying. Missing/corrupt history checks returned exit 1. Valid two-run transfer still passed. |
| Medium | CI retries allowed a flaky pass to produce a green test gate. | Enabled `failOnFlakyTests` for CI. An isolated fail-then-pass probe produced `1 flaky` and exit 1. Diagnostic retry remains available. |
| Medium | QA-002 overstated the lack of accessible names based on HTML attributes alone. | Actual Chromium accessibility snapshot shows an unnamed checkbox and delete button named “×” from CSS. Corrected the finding and approach to describe the verified descriptive-name limitation. |
| Low | UI-created fixture baseline was not asserted after creation; filter selection checks were incomplete; blur edit lacked an active-status/count assertion. | Added exact baseline/count, Completed/All hash and selected-class assertions, and blur-edit status/count assertions. Full repeated suite passed. |

## Areas inspected without a confirmed code defect

- **Application assumptions:** initial sample tasks, change-event creation, whitespace handling, Escape cancellation, blank edit deletion, hash filtering and empty-list reseeding agree with source/runtime. Empty-list reseeding remains a product clarification, not a claimed defect.
- **Selectors:** exact title scope plus role-based checkbox/link locators avoid positional coupling. `.destroy`, `.edit`, `.todo-count` and list classes are justified by the current markup. Duplicate titles intentionally produce a multi-match locator and are checked by count. Styling-class assertions reflect this application's rendered completion/filter state. The visible bulk-control label is the right click target.
- **Isolation:** each test has its own built-in context and localStorage. No shared mutable task data, `beforeAll`, storage seeding or ordering dependence. UI fixture deletion/recreation works around the separately covered seed-ID defect. This adds setup cost and means broken creation/deletion can cause widespread fixture failures, but named steps identify the failure.
- **Simplicity/types:** one cohesive page object and one typed fixture are sufficient. No base page or framework hierarchy is warranted. Strict TypeScript/unused-symbol checks pass. No `any`, arbitrary waits or unused abstraction was introduced.
- **Docker:** source commit, automation lockfile, app lockfile and browser/package version match are pinned. Production-only upstream install suppresses unrelated scripts. `npm --prefix` starts from the app project; `webServer` owns readiness and process-group shutdown. Actual Linux execution, fresh-source dependency parity and lifecycle behaviour remain unverified because Docker cannot start. Tags/apt repositories are not immutable digests/snapshots; byte-for-byte reproducibility is not claimed.
- **CI result handling:** Bash captures the Docker element of `PIPESTATUS` immediately after `tee`, uploads artifacts before the final test-exit step, and does not use `continue-on-error`. A failed build/report/action still fails its job. Main publication can proceed after test failure, but requires a valid generated report and successful history restoration. PR jobs cannot publish.
- **Allure persistence:** raw results are cleaned per ordinary run; previous history is restored before generation. The `gh-pages` branch persists beyond artifact expiry; workflow-wide serialization avoids overlapping main publication. First-run and second-run local Git publication/retrieval were exercised against an isolated local bare repository. This validates the Git portion, not GitHub authentication, Actions artifacts, rsync, Pages permissions or deployment.

## Validation after fixes

- Strict TypeScript: passed.
- `actionlint 1.7.12`: passed for the revised workflow.
- Four workers, three repetitions, zero retries: **45 passed in 57.2 s**, including three acknowledged expected product failures.
- CI-mode configuration, two workers: **15 passed in 15.1 s**, including one acknowledged expected product failure.
- Intentional fail-then-pass probe: **1 flaky, exit 1**, as required by the new CI gate.
- Intentional browser failure: **exit 1**, screenshot/video/trace/error-context attachments generated and their referenced files inspected.
- Report guard cases: missing results, empty results, explicitly missing history and corrupt history each rejected with **exit 1**.
- Revised report generation with valid prior history: passed; **two trend entries and two executions for each of 15 ordinary-run test identities**. Allure's `--repeat-each` Repetition parameter gives stress runs different identities; those must not be mistaken for broken normal-run history.
- Local Git simulation: first `gh-pages` creation, subsequent fast-forward publication, independent clone/history retrieval passed. No GitHub repository was contacted or changed by that simulation.
- Product findings rechecked: natural duplicate sample IDs reproduced, wrong completion state confirmed, empty-list reload reseeded samples, accessibility tree inspected.
- Docker availability rechecked: **“Docker Desktop is unable to start”**. No Docker or hosted CI success is claimed.

Temporary probes are under ignored `.tmp/` and excluded from the submission suite. They are diagnostic checks, not additional product tests.

## Unresolved findings and submission gaps

1. **QA-001 is still a product defect.** The scoped expected-failure test is deliberate technical debt. The report's green status measures the expected automation outcome, not defect-free product acceptance. Its screenshot/state/ID attachments and finding must accompany review. Remove the annotation after a verified product fix; an unexpected pass currently fails execution.
2. Docker build/run, container startup/shutdown and dependency installation from the clean upstream pin remain unverified. Repair/start Docker Desktop and execute the documented commands before submission.
3. GitHub workflow execution, report artifact upload, Pages access and history across two actual main runs remain unverified. The local Git/history checks do not replace these checks.
4. The PDF's repository URL/reviewer-access deliverable is absent because no remote has been created/pushed. The GitHub issue exists only as a complete draft; publication requires the user's approval. These are incomplete submission requirements.
5. Only Chromium desktop is covered. Comprehensive accessibility, other browsers and multitab behaviour remain documented exclusions. No requirement in the PDF mandates additional browsers.

## Five interview decisions to defend

1. **Risk-based coverage:** explain why state transitions, correct target selection, filtered membership and persistence provide more confidence than a large set of near-identical tests. Show how distinct blank-create/blank-edit semantics influenced coverage.
2. **Built-in context isolation with UI data setup:** localStorage is browser-scoped, so each context isolates data without server cleanup. Explain the fixture's setup cost and why it replaces defective samples through the UI while preserving a separate bug regression.
3. **A small page object with assertions in tests:** interactions/locators change in one place, while expected behaviour remains visible. Explain why an unlabeled control needs scoped CSS and why re-rendered filter items need click-plus-result assertions rather than an element-survival postcondition.
4. **Reproducible execution boundaries:** Docker fetches a fixed upstream commit and uses lockfiles with a matching Playwright browser image. Local execution uses an existing app; container execution owns readiness/cleanup. Distinguish configuration reproducibility from unverified execution and fully immutable build inputs.
5. **Reporting and CI as part of correctness:** test failure must survive reporting, failure evidence must be available, history needs durable state plus serialization, and retry success must not conceal instability. Explain the known-defect expected-failure tradeoff and the difference between a green automation run and product acceptance.
