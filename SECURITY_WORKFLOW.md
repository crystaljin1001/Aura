# Security Workflow - Aura Project

## Overview

This project uses **Semgrep** for automated security scanning to enforce critical security guardrails before every commit. This ensures that hardcoded credentials, XSS vulnerabilities, and other security issues are caught before they enter the codebase.

## Requirements

Before every commit, Claude Code will automatically run the security preflight check. You **cannot bypass this check** - all critical issues must be fixed before committing.

## Installation

Semgrep has been installed via pip:

```bash
python3 -m pip install semgrep --user
```

Location: `/Users/crystaljin/Library/Python/3.9/bin/semgrep`

## Configuration

### Semgrep Rules (`.semgrep.yml`)

The following security rules are enforced:

1. **XSS Prevention (CRITICAL)**
   - Detects `dangerouslySetInnerHTML` usage
   - Requires sanitization via `sanitizeString()` from `src/features/impact-engine/utils/sanitize.ts`
   - CWE-79: Cross-site Scripting

2. **Type Safety (WARNING)**
   - Detects `any` type usage in TypeScript
   - Project policy: Zero tolerance for `any` types
   - Use `unknown` with type guards instead

3. **Weak Randomness (WARNING)**
   - Detects `Math.random()` usage
   - For security operations (tokens, IVs), use `crypto.getRandomValues()`
   - CWE-338: Cryptographically Weak PRNG

4. **Missing Authentication (WARNING)**
   - Detects server actions without authentication checks
   - Functions with `store`, `save`, `delete`, `update`, `create`, or `remove` in their name
   - Must call `await getAuthenticatedUser()` or `supabase.auth.getUser()`
   - CWE-862: Missing Authorization

### Security Preflight Script (`scripts/security-preflight.sh`)

Automated script that:
- ✅ Runs Semgrep on all staged TypeScript/JavaScript files
- ✅ Blocks commits if CRITICAL issues are found
- ✅ Shows detailed findings with fix suggestions
- ✅ Allows warnings but highlights them for review
- ❌ Cannot be bypassed - all critical issues must be fixed

## Usage

### Manual Scan

Run a security scan on the entire codebase:

```bash
# Scan for critical issues only
export PATH="/Users/crystaljin/Library/Python/3.9/bin:$PATH"
semgrep --config .semgrep.yml --severity ERROR src/

# Scan for all issues (including warnings)
semgrep --config .semgrep.yml src/
```

### Pre-Commit Check

The security preflight check is run automatically by Claude Code before every commit. You can also run it manually:

```bash
./scripts/security-preflight.sh
```

**If critical issues are found**, the script will:
1. Display all security findings
2. Block the commit
3. Show fix suggestions
4. Exit with code 1

**Required actions when blocked:**
1. Review the security issues listed
2. Fix ALL critical issues in the reported files
3. Stage your fixes: `git add <file>`
4. Run the check again: `./scripts/security-preflight.sh`
5. Commit only after all issues are resolved

### Common Fixes

| Issue | Fix |
|-------|-----|
| **Hardcoded credentials** | Move to `.env.local` with `process.env.VARIABLE_NAME` |
| **XSS risk** | Use `sanitizeString()` before rendering user/external data |
| **Missing auth** | Add `const user = await getAuthenticatedUser()` at function start |
| **'any' types** | Replace with `unknown` and use type guards |
| **Weak randomness** | Replace `Math.random()` with `crypto.getRandomValues()` |

## Claude Code Integration

Claude Code will automatically:

1. **Before every commit:**
   - Run `./scripts/security-preflight.sh`
   - Scan all staged `.ts`, `.tsx`, `.js`, `.jsx` files
   - Block commit if critical issues found

2. **When issues are detected:**
   - Show the full Semgrep output
   - Explain each security issue
   - Provide fix suggestions
   - Re-scan after fixes are applied

3. **Never bypass guardrails:**
   - Cannot use `--no-verify` or similar flags
   - All critical issues must be addressed
   - Warnings are shown but don't block commits

## Security Rules Details

### Dangerous Inner HTML (ERROR)

**Detects:**
```typescript
<div dangerouslySetInnerHTML={{__html: userContent}} />
```

**Fix:**
```typescript
import { sanitizeString } from '@/features/impact-engine/utils/sanitize';

<div>{sanitizeString(userContent)}</div>
```

### TypeScript 'any' Type (WARNING)

**Detects:**
```typescript
function processData(data: any) { ... }
const result: any = fetchData();
```

**Fix:**
```typescript
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type guard to narrow type
    return data;
  }
  throw new Error('Invalid data');
}

const result: User = fetchData(); // Use specific type
```

### Weak Randomness (WARNING)

**Detects:**
```typescript
const id = Math.floor(Math.random() * 1000000);
```

**Fix:**
```typescript
// For non-security purposes (UI IDs, etc.)
const id = Math.floor(Math.random() * 1000000); // OK

// For security (tokens, IVs, session IDs)
const iv = crypto.getRandomValues(new Uint8Array(12));
```

### Missing Authentication (WARNING)

**Detects:**
```typescript
export async function deleteRepository(owner: string, repo: string) {
  const supabase = await createClient();
  await supabase.from('user_repositories').delete()...
}
```

**Fix:**
```typescript
export async function deleteRepository(owner: string, repo: string) {
  const user = await getAuthenticatedUser(); // Add this!
  const supabase = await createClient();

  await supabase
    .from('user_repositories')
    .delete()
    .eq('user_id', user.id) // Use authenticated user ID
    ...
}
```

## Adding New Rules

To add custom security rules, edit `.semgrep.yml`:

```yaml
rules:
  - id: your-custom-rule
    pattern: <dangerous-pattern>
    message: "CRITICAL: Explanation of the issue and how to fix it"
    languages:
      - typescript
      - javascript
    severity: ERROR  # or WARNING, INFO
    metadata:
      category: security
      cwe: "CWE-XXX: Description"
```

Test the rule:
```bash
export PATH="/Users/crystaljin/Library/Python/3.9/bin:$PATH"
semgrep --config .semgrep.yml --test
```

## Troubleshooting

### Semgrep not found
```bash
# Add to PATH
export PATH="/Users/crystaljin/Library/Python/3.9/bin:$PATH"

# Or reinstall
python3 -m pip install semgrep --user
```

### False Positives

If a rule triggers incorrectly, you can:

1. **Suppress specific findings** (use sparingly):
```typescript
// nosemgrep: rule-id-here
const data: any = legacyApi(); // Temporary: migrating legacy code
```

2. **Update the rule** in `.semgrep.yml` to be more specific

3. **Report false positives** to improve the rules

### Script Permission Denied

```bash
chmod +x scripts/security-preflight.sh
```

## Best Practices

1. **Run scans frequently** - Don't wait until commit time
2. **Fix issues immediately** - Security debt compounds quickly
3. **Review warnings** - They may indicate design problems
4. **Update rules** - Add new rules as you discover patterns
5. **Test rules** - Ensure they catch real issues without too many false positives

## References

- [Semgrep Documentation](https://semgrep.dev/docs/)
- [Semgrep Rule Registry](https://semgrep.dev/r)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Database](https://cwe.mitre.org/)

## Enforcement Policy

⚠️ **CRITICAL**: This security workflow is non-negotiable. Claude Code is configured to:

- ✅ Always run security checks before commits
- ❌ Never bypass security guardrails
- ✅ Block commits with critical security issues
- ✅ Explain and help fix all detected issues
- ✅ Re-scan after fixes to verify resolution

**All team members must comply with this policy. No exceptions.**
