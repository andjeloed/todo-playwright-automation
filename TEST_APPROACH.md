# Test approach

## Objective and scope

Provide useful confidence in the ToDo workflows at application commit `dca70562c010156b05cc8b54e641f67c0063d5dc`, with reproducible execution and understandable evidence. The complete two-page assessment PDF was read before implementation. Its assignment and reporting requirements drive the solution; candidate scenarios from the user's brief were checked against the implementation.

Only `/todo` is in scope. Existing Cypress tests, other Kitchen Sink pages, authentication/backend APIs (none used by this ToDo implementation), exhaustive visual regression, performance, mobile, cross-browser and a full accessibility audit are excluded. Chromium gives a focused, low-cost assessment baseline.

## Application analysis

`app/todo.html` loads the vanilla JavaScript model/view/controller under `app/assets/js/todo/`. `npm start` invokes `scripts/start.js`, which runs `serve` using `serve.json` to expose `app/` on port 8080. There is no build or database dependency for ToDo.

The `todos-vanillajs` localStorage array stores title, completed and millisecond timestamp ID. A fresh context starts with “Pay electric bill” and “Walk the dog”; empty storage is reseeded on reload. There is no server-side task state to clean up.

New tasks are committed by the input's change event (Enter or blur); blank/whitespace is rejected and titles are trimmed. Duplicate titles are allowed. Double-click starts editing; Enter or blur saves; Escape cancels; a blank edited title deletes the item. Checkboxes toggle status; a label activates bulk toggle; delete appears on row hover. All/Active/Completed are hash routes. The footer counts all active tasks, including those hidden by the current filter. Clear completed removes completed tasks; list/footer controls hide when the full list is empty, but remain when a filter alone has no matches.

Task checkboxes have no accessible names; the delete button is named “×” through CSS-generated content, which lacks a descriptive action/target. The page object scopes checkbox roles and stable CSS classes to exact task text. The bulk checkbox is visually covered by list content; click its associated visible label. Filter changes replace DOM nodes, so click task checkboxes and assert the resulting list in the tests rather than requiring the original element to survive a `setChecked` postcondition.

## Priorities and selected coverage

| Test | Risk and assertions |
| --- | --- |
| P0 create multiple tasks | Ordered titles, active default, input cleared, trimming, count |
| P0 delete selected task | Correct survivor and singular count |
| P0 complete/reactivate | Checkbox, class, counts and clear-control visibility |
| P0 clear completed | Active task retained; completed removed |
| P0 All/Active/Completed | Mixed data, exact membership, hash and selected filter |
| P1 edit via Enter and blur | Titles trimmed, edits saved, completion preserved |
| P1 bulk completion/reactivation | Mixed initial state, all checkbox states, counts |
| P1 live filter updates | Task disappears when no longer matching; empty filtered view remains navigable |
| P1 reload persistence | Added/edited/deleted tasks and status survive; filter hash survives; cleared completion remains deleted |
| P1 QA-001 regression | Duplicate seeded IDs update wrong task; deterministic expected failure |
| P2 blank creation | Empty and whitespace rejected; count unchanged |
| P2 duplicate titles | Separate records supported |
| P2 cancel edit | Original title survives Escape and reload |
| P2 blank edit | Removes task and updates count |
| P2 empty list | Controls hide and user can create a new task |

There are 15 tests: 14 ordinary behavioural tests plus one acknowledged product-defect regression. Multiple assertions share a test where they describe one transition, avoiding redundant permutations. Separate blank-edit/blank-create checks matter because the application treats them differently. Duplicates are asserted by count rather than clicking an ambiguous title. We do not claim empty-list persistence is required without a product decision. Multitab storage events, very long strings, XSS input and timestamp collision unit tests would be useful follow-ups, but are less valuable than the selected core workflows within this scope.

## Architecture, data and reliability

One `TodoPage` owns application locators/interactions; meaningful assertions remain in specs. No base class, global state or custom assertion framework is needed. A typed Playwright fixture opens the application and verifies the real seed baseline. It deletes both sample tasks in order using the UI, then adds independent deterministic baseline tasks. This isolates the confirmed seed-ID bug from other workflows without changing storage directly, the product source, or assertions.

Fresh Playwright contexts already isolate localStorage. There is no redundant storage clearing, shared context or `beforeAll`. UI setup uses production event handling. Reusing fixed titles across tests is safe because contexts are independent. The dedicated defect test freezes Date before navigation to reliably reproduce same-millisecond IDs; it does not alter the application. `test.fail` applies only after setup and the target action, to the correct business assertions. Unexpected passes fail the suite. This deliberate exception and product risk remain visible in the findings and report attachments.

Retrying assertions and Playwright actionability checks replace arbitrary sleeps. Local retries are zero; CI permits one diagnostic retry, with retained evidence, while repeated local verification uses zero retries. CI enables `failOnFlakyTests`, so passing on retry still fails the quality gate. All tests run in parallel, including within files. Type checking enforces strict types and unused-symbol checks. Failures were investigated: seed-ID collisions are a product defect; using `setChecked` on filtered elements was an automation mismatch corrected with a click plus business assertions.

## Reporting, Docker and CI decisions

Allure 2 was chosen because the existing dependencies provide readable nested steps, assertion details, attachments and established history/trend files. The Playwright HTML reporter is not configured. A deliberate temporary failing test verified that screenshots, video and trace files reach Allure and that failure returns a nonzero exit. That probe is ignored and excluded from the submitted suite.

The official Playwright image supplies matching browser/system dependencies. A single Docker stage keeps construction understandable; copying a second application stage would add little here. Git fetch retrieves an immutable application commit independently of either Windows folder. Production-only upstream `npm ci --ignore-scripts` avoids the unrelated Cypress binary and development hooks. Automation uses its tracked lockfile and includes Java for Allure generation. Playwright owns server readiness and teardown, and container execution preserves failures. The daemon limitation means these Docker mechanisms have not yet been executed here.

CI runs the Docker image, records its exit code, generates reports and uploads evidence before propagating failure. A separate main-only job saves the report/history in `gh-pages` and deploys Pages even when tests failed. Read-only PR jobs cannot publish. Official maintained action major versions were checked against their repositories; `actionlint` validates the workflow locally. No remote execution has occurred.

Previous `history/` is copied into new Allure results before report generation. The branch survives artifact expiry and main workflow serialization prevents overlapping publication races. First-run absence is explicit; network/auth failures are not treated as missing history, and publication requires successful restoration. Missing/empty raw results or missing/corrupt requested history fail generation. Main contributes to published rolling trends; PR artifacts remain reviewable separately. Older report contents remain in branch commits; full CI evidence has 30-day retention. Independent ordinary local reports validate per-test history transfer; stress repetitions have separate Allure identities. An isolated local Git simulation verified first and subsequent branch publication and history retrieval, but two real CI runs and Pages access must still be checked after publication.

## Assumptions, risks and further work

- Pinning establishes a baseline, not a promise that upstream never changes. Upgrade the app and tests together.
- Source inspection and runtime checks confirm behaviour; observations without a product requirement are labelled for clarification.
- Green execution includes the known expected failure; it is not product acceptance for QA-001.
- Docker requires a running Linux engine and network access during build. GitHub requires repository setup, reviewer access and Pages permissions.
- Upstream lockfile was already locally modified when inspected; no application tracked files were edited or restored. Docker uses the clean pinned upstream version, so the first container run must confirm parity.
- With more time: resolve the ID defect upstream, verify accessible control names, clarify empty-state persistence, exercise additional browsers and Docker lifecycle failure paths, and pin action/container digests under an automated update policy.

See [actual validation and requirement audit](docs/ASSESSMENT_AUDIT.md) for what was executed and what remains incomplete.
