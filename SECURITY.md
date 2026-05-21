# Security policy

## Supported versions

Each `@amali-tech` package supports the latest **major** version published to npm. Older majors may receive critical fixes at the maintainers' discretion.

## Reporting a vulnerability

**Please do not open public GitHub issues for security reports.**

Use one of the following private channels:

1. **GitHub private vulnerability reporting** — preferred. Open the affected repo, go to the **Security** tab → **Report a vulnerability**.
2. **Email** — `security@amalitech.com`. Include "SECURITY" in the subject line.

When reporting, please include:

- The affected package and version range.
- A description of the issue and its impact.
- Steps to reproduce, or a minimal proof of concept.
- Any suggested remediation if you have one.

## Response timeline

- **Acknowledgement:** within 3 business days.
- **Initial assessment:** within 7 business days.
- **Coordinated disclosure:** we aim to ship a fix and publish an advisory within 30–90 days, depending on severity and complexity.

## Disclosure

We follow coordinated disclosure. After a fix is released, we will publish a [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories) and credit the reporter unless they prefer to remain anonymous.

## Scope

In scope: code in `@amali-tech/*` packages and the CI/release infrastructure that builds and publishes them.

Out of scope: third-party services we depend on (npm, GitHub, etc.) — report those to the respective vendor.
