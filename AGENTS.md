<!-- fallow:setup-hooks:start -->
## Fallow local gate

Before any `git commit` or `git push`, run `fallow audit --format json --quiet --explain`. If the verdict is `fail`, fix the reported findings before retrying. Treat JSON runtime errors like `{ "error": true, ... }` as non-blocking.

Audit defaults to `gate=new-only`: only findings introduced by the current changeset affect the verdict. Inherited findings on touched files are reported under `attribution` and annotated with `introduced: false`, but do not block the commit. Set `[audit] gate = "all"` in `fallow.toml` to gate every finding in changed files.
<!-- fallow:setup-hooks:end -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:developing-locally-agent-rules -->
## REQUIREMENTS

- Bun runtime is to be used exclusively.
- bun run dev has been modified to deploy development on <project-name>.localhost
- bun run build cannot be used to verify that the project builds
- bun tsc --watch and bun lint can be used to verify that typescript is valid.
- bun tsc && bun lint --fix must be run before committing changes.
- ~/bin/freview (outputs ./REVIEW.md) must be run and satisfied/resolved before pushing commits.
  - bunx --bun fallow health --quiet --explain
  - bunx --bun fallow audit --quiet --explain
  - bunx --bun fallow dead-code --quiet --explain
  - bunx --bun fallow dupes --quiet --explain
- prefer graphite to git/gh see ~/.config/aliases (you must check that the project is tracked in graphite otherwise this does not apply.)

## Next.js Bun Blacksmith Law

When a Next.js project has both `bun.lock` and `.next/` at the project root:

- Local preflight is `bun lint`, then `~/bin/freview`; `bun lint` is the canonical local gate and must run Biome format, Oxlint fix, and `tsgo --noEmit`.
- Production CI must not run lint, typecheck, tests, or freview; those are local pre-push gates.
- Production Blacksmith/Vercel prebuilt CI installs with `bun install --production --frozen-lockfile`.
- Any package needed by `vercel build --prod` must be in `dependencies`, not `devDependencies`.
- Restore `~/.bun/install/cache` and `.next/cache` in CI before install/build.
- Run the Vercel CLI with `bunx vercel`, not `bunx --bun vercel`, for pull/build/deploy/inspect steps.
- Deploy only archived `.vercel/output` with `vercel deploy --prebuilt --archive=tgz`.
- Protected branch pre-push hooks must run `bun lint` first, then `~/bin/freview`; freview remains outside the lint script.
- Be mindful of build minute costs, never push to main unless you've verified locally the project will build in ci, and the changes will make a real difference to users of the production app.

## 12 Contribution Commandments

These rules apply to every task in this project unless explicitly overridden.
Bias: caution over speed on non-trivial work. Use judgment on trivial tasks.

### Rule 1 — Think Before Coding

State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

### Rule 2 — Simplicity First

Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

### Rule 3 — Surgical Changes

Touch only what you must. Clean up only your own mess.
Don't "improve" adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

### Rule 4 — Goal-Driven Execution

Define success criteria. Loop until verified.
Don't follow steps. Define success and iterate.
Strong success criteria let you loop independently.

### Rule 5 — Use the model only for judgment calls

Use me for: classification, drafting, summarization, extraction.
Do NOT use me for: routing, retries, deterministic transforms.
If code can answer, code answers.

### Rule 6 — Token budgets are not advisory

Per-task: 4,000 tokens. Per-session: 30,000 tokens.
If approaching budget, summarize and start fresh.
Surface the breach. Do not silently overrun.

### Rule 7 — Surface conflicts, don't average them

If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

### Rule 8 — Read before you write

Before adding code, read exports, immediate callers, shared utilities.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

### Rule 9 — Tests verify intent, not just behavior

Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

### Rule 10 — Checkpoint after every significant step

Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

### Rule 11 — Match the codebase's conventions, even if you disagree

Conformance > taste inside the codebase.
If you genuinely think a convention is harmful, surface it. Don't fork silently.

### Rule 12 — Fail loud

"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.
<!-- END:developing-locally-agent-rules -->

## Further Reading

If the following files exist at the repo root please consider reading:

- README.md
- PLAN.md
- ROADMAP.md
- CONTRIBUTING.md
- STANDARDS.md
