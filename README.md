# @amali-tech package template

> The starting point for every package published under the [`@amali-tech`](https://www.npmjs.com/org/amali-tech) npm scope.

This is a **GitHub template repository**. To start a new package, click the green **"Use this template"** button at the top of the GitHub page and create a new repo under the [`amalitech-packages`](https://github.com/amalitech-packages) org.

The template ships pre-wired with:

- **TypeScript** strict mode, ESM-first build
- **Vitest** for testing (unit + coverage)
- **ESLint 9** (flat config) + **Prettier**
- **Changesets** for versioning and automated npm releases
- **GitHub Actions** for CI (lint, typecheck, build, test) and release publishing with [npm provenance](https://docs.npmjs.com/generating-provenance-statements)
- **Husky** + **lint-staged** pre-commit hooks
- **Dependabot** for dependency updates
- **CodeQL** for security scanning
- Apache-2.0 license, CODEOWNERS, issue & PR templates

---

## After creating your repo from this template

1. Clone it locally and run the setup script — it will rename every placeholder for you:

   ```bash
   git clone https://github.com/amalitech-packages/<your-package-name>.git
   cd <your-package-name>
   corepack enable
   pnpm install
   pnpm setup
   ```

2. The setup script asks for:
   - The package name (e.g. `logger`, `redis-cache`) — used as `@amali-tech/<name>`
   - A one-line description
   - Whether the package will be **public** or **private** on npm

   It rewrites `package.json`, this README, and a few other files, then deletes itself.

3. Write your code in `src/`, tests beside the source as `*.test.ts`.

4. Open a PR. Don't forget the changeset (`pnpm changeset`).

---

## Daily commands

```bash
pnpm build         # tsc → dist/
pnpm dev           # tsc --watch
pnpm test          # vitest
pnpm test:watch
pnpm typecheck
pnpm lint
pnpm format
pnpm changeset     # record a version bump for your PR
```

## Releasing

You don't publish manually. On every merge to `main`:

1. The **Release** workflow runs.
2. If there are pending changesets, it opens a _"Version Packages"_ PR.
3. When a maintainer merges that PR, the workflow publishes to npm with provenance and tags the GitHub release.

You'll need to set the `NPM_TOKEN` secret on each repo (npm Automation token, granular scope). See [CONTRIBUTING.md](./CONTRIBUTING.md#releasing).

## Where the org-level rules live

This template carries its own `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue templates, and PR template. If you also create a [`amalitech-packages/.github`](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file) repo at the org level, those files become the org-wide default and individual repos can omit them — pick whichever you prefer.

## License

[Apache-2.0](./LICENSE). © AmaliTech.
