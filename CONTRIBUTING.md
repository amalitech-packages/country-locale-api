# Contributing

Thanks for contributing to an `@amali-tech` package! This guide is the contract for how changes land here.

By participating you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Branching](#branching)
- [Commit conventions](#commit-conventions)
- [Code style](#code-style)
- [Testing](#testing)
- [Writing a changeset](#writing-a-changeset)
- [Opening a pull request](#opening-a-pull-request)
- [Review process](#review-process)
- [Releasing](#releasing)
- [Reporting bugs](#reporting-bugs)

---

## Prerequisites

- **Node.js 22+** (see [`.nvmrc`](./.nvmrc))
- **pnpm 9+** — `corepack enable && corepack prepare pnpm@9 --activate`
- **Git** with your AmaliTech identity configured

## Local setup

```bash
git clone https://github.com/amalitech-packages/<repo>.git
cd <repo>
pnpm install
pnpm build
pnpm test
```

If anything fails on a fresh clone, that is a bug — please open an issue.

## Branching

- Branch off `main`. Long-lived feature branches need a maintainer's blessing.
- Naming: `<type>/<short-summary>` — e.g. `feat/json-format`, `fix/reconnect-storm`, `chore/upgrade-deps`.
- Keep branches focused on one logical change.

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/). Your PR title follows the same format because it becomes the squash-commit message.

```
<type>(<scope>): <summary>

<body>

<footer>
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`.

Examples:

```
feat: add structured JSON output mode
fix: handle reconnect storm under burst load
chore: bump pnpm to 9.15
```

Breaking changes get a `!`: `feat!: drop CommonJS build`. Include a `BREAKING CHANGE:` footer explaining the migration.

## Code style

- **Formatting:** Prettier handles all formatting. `pnpm format` before pushing.
- **Linting:** ESLint catches the rest. `pnpm lint:fix` to auto-fix.
- **Types:** Avoid `any`; reach for `unknown` and narrow.
- **Imports:** Use `import type { ... }` for type-only imports (enforced).
- **No default exports** — named exports only (better for tree-shaking and refactoring).

A pre-commit hook (`husky` + `lint-staged`) runs formatter + linter on staged files. To bypass in an emergency: `git commit --no-verify` — fix it in the next commit.

## Testing

- Runner: **[Vitest](https://vitest.dev/)**.
- Co-locate tests with source: `src/foo.ts` ↔ `src/foo.test.ts`.
- Test behavior, not implementation.
- Integration tests requiring external services (Redis, Postgres) should be gated behind an env var so they don't run in plain `pnpm test`.

## Writing a changeset

Every PR that changes the package's public surface, runtime behavior, or dependencies **must** include a changeset. CI fails without one.

```bash
pnpm changeset
```

The CLI asks for the bump:

- **patch** — bug fixes, internal changes, doc updates that ship with the package
- **minor** — new features, non-breaking additions
- **major** — breaking changes

The generated `.changeset/<name>.md` becomes the changelog entry for the release. Write it for users, not the team:

```md
---
'@amali-tech/logger': minor
---

Add structured JSON output mode for production environments. Enable with `logger.setFormat('json')`.
```

For changes that don't affect users (CI tweaks, README updates, etc.), no changeset is needed — add the `skip-changeset` label to the PR.

## Opening a pull request

Before pushing:

- [ ] `pnpm lint && pnpm typecheck && pnpm build && pnpm test` pass locally
- [ ] You added a changeset (or the change is non-user-facing)
- [ ] Updated `README.md` for any user-facing change
- [ ] Commit messages follow conventional commits

Then open the PR against `main`. Fill out the PR template — the _why_ and _risk_ fields matter most.

## Review process

- All PRs need **at least one** approving review from a maintainer (see [CODEOWNERS](./.github/CODEOWNERS)).
- CI must be green.
- Maintainers squash-merge, using the PR title as the commit message — so make it good.
- Stale PRs (30+ days inactive) may be closed; reopen when you're ready.

## Releasing

Releases are automated by the [Changesets GitHub Action](https://github.com/changesets/action).

1. PR merges to `main`.
2. The **Release** workflow runs. If there are pending changesets, it opens (or updates) a _"chore: version package"_ PR that bumps the version and writes the changelog.
3. A maintainer reviews and merges that PR.
4. On merge, the workflow publishes to npm with [provenance](https://docs.npmjs.com/generating-provenance-statements) and tags the GitHub release.

**Required secrets** (set per repo, or as org-level secrets):

- `NPM_TOKEN` — an npm Automation token with publish access to the `@amali-tech` scope.

Don't publish manually. If you think you need to, ask a maintainer first.

## Reporting bugs

Use the bug report template. Include:

- Package version
- Minimal reproduction
- What you expected vs what happened
- Node version, OS, anything else weird about your environment

For security issues, see [SECURITY.md](./SECURITY.md) — do not open a public issue.
