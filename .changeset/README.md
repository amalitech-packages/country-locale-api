# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

To record a change for the next release, run:

```bash
pnpm changeset
```

The CLI will prompt you for the bump type (`patch`, `minor`, or `major`) and a summary. Commit the generated file with the rest of your PR.

For repo-level changes that don't affect the package's published surface (CI tweaks, docs, etc.), no changeset is needed — add the `skip-changeset` label to the PR.

See [CONTRIBUTING.md](../CONTRIBUTING.md#writing-a-changeset) for details and examples.
