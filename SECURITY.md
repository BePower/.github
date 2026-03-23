# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in any BePower repository, please report it responsibly.

**Do NOT open a public issue.**

Instead, please email: **security@bepower.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment | Within 2 business days |
| Initial assessment | Within 5 business days |
| Fix or mitigation | Depends on severity |

## Severity Levels

| Level | Description | Response |
|-------|-------------|----------|
| **Critical** | Remote code execution, data breach, credential exposure | Immediate patch |
| **High** | Privilege escalation, significant data exposure | Patch within 1 week |
| **Medium** | Limited impact, requires specific conditions | Patch within 1 month |
| **Low** | Minimal impact, informational | Next scheduled release |

## Security Best Practices

All BePower projects follow these practices:

- Dependencies are audited via `npm audit` and Dependabot
- Lockfile integrity is verified with `lockfile-lint`
- No secrets in code — use environment variables or secret managers
- GitHub branch protection on `main`
- Automated security scanning via GitHub Actions

## Supported Versions

Only the latest major version of each package receives security updates. Older versions should be upgraded.

## Acknowledgments

We appreciate responsible disclosure and will credit reporters (with permission) in release notes.
