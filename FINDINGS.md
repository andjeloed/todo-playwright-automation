# Quality findings

Inspected application commit: `dca70562c010156b05cc8b54e641f67c0063d5dc`.
Verified on 2026-11-02 using Windows, Node 24.13.0, Playwright 1.64.1 Chromium and `http://localhost:8080/todo`.

## QA-001 — Sample tasks can share an ID and update the wrong task

- **Type:** verified functional defect; **priority:** P1; **severity:** major (incorrect task modified).
- **Precondition:** a new browser context with no stored tasks; sample tasks created in the same millisecond.
- **Steps:** open `/todo`; complete “Walk the dog”; inspect both task styles, checkboxes and saved state; reload.
- **Expected:** only “Walk the dog” is completed, including after reload.
- **Actual:** “Pay electric bill” becomes completed in storage and receives completed styling; “Walk the dog” can show a checked checkbox without completed styling. After reload the first task is completed and the second is active.
- **Impact:** users cannot reliably complete, edit or remove a specific task when IDs collide. Clear-all operations are also affected by duplicate IDs.
- **Evidence:** direct browser reproduction returned both IDs as `1793631541720`. Saved state after clicking the second task was `[{"title":"Pay electric bill","completed":true,"id":1793631541720},{"title":"Walk the dog","completed":false,"id":1793631541720}]`. See [screenshot](docs/evidence/QA-001.png), the `sample-task-ids` Allure attachment and [regression](tests/todo-known-defect.spec.ts).
- **Cause:** `app/assets/js/todo/store.js` creates IDs with `new Date().getTime()`; `app.js` synchronously creates two sample tasks. Model/view updates select the first matching ID.
- **Improvement:** generate collision-resistant IDs and use a consistent ID type throughout model, view and event handlers. Cover same-millisecond additions in product unit tests.
- **Automation handling:** regression fixes the browser's Date value to reproduce the timing condition reliably, then asserts correct behaviour with `test.fail`. This is an acknowledged expected failure, not a repaired product. An unexpected pass fails the suite and requires investigation/removal of the annotation. Other tests delete samples through the UI and create independent tasks.
- **Issue:** [ready-to-publish draft](docs/issues/QA-001.md); no issue has been published.

## QA-002 — Task controls lack descriptive, task-specific accessible names

- **Type:** verified accessibility/testability concern; **priority:** P2; **severity:** moderate.
- **Precondition:** at least one task exists.
- **Steps:** inspect the task checkbox and delete button in browser accessibility tools/DOM; hover the row to reveal delete.
- **Expected:** each control exposes its action and target task, e.g. “Complete Walk the dog” and “Delete Walk the dog”.
- **Actual:** the checkbox has no accessible name; its sibling task label is not associated. The delete button has the accessible name **“×”**, supplied by CSS `::after` content, but does not describe its action or target task. Missing `aria-label` alone was insufficient evidence for the earlier claim that the button had no name.
- **Impact:** controls are ambiguous to assistive technology and require scoped CSS locators in automation.
- **Evidence:** `app/assets/js/todo/template.js`, `defaultTemplate`, and `todo.css` `.destroy:after`; Chromium accessibility snapshot after hovering a row contains an unnamed `checkbox`, task text, and `button "×"`. Verified during the independent implementation review.
- **Improvement:** associate task text with the checkbox and supply a task-specific accessible delete name. Accessibility conformance has not been comprehensively audited.

## QA-003 — An empty list is repopulated on reload

- **Type:** observed behaviour requiring product clarification; **priority:** P2; no confirmed defect severity.
- **Precondition:** remove all tasks.
- **Steps:** confirm the list is empty, then reload `/todo`.
- **Expected:** product decision needed: should a demo reseed samples, or preserve a deliberately empty list?
- **Actual:** `app.js:init` adds both samples whenever the stored array is empty, including after a user clears it.
- **Impact:** a user's empty state cannot persist; empty-state persistence needs an explicit requirement.
- **Evidence:** source inspection and dedicated browser check during assessment validation.
- **Improvement:** if persistent emptiness is intended, seed only when the storage key is absent. The suite checks empty controls before reload and persistence with a nonempty list; it does not claim this observation is a confirmed defect.
