#!/bin/sh
set -eu
npm run typecheck
node scripts/clean-results.mjs
# Playwright owns the server process group, readiness check and shutdown.
# exec preserves its exit code and forwards container signals.
exec npx playwright test "$@"
