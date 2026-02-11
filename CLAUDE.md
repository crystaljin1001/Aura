# Builder's OS - Claude Memory File

This file persists architectural decisions, coding standards, and security rules across Claude sessions. Always reference this file when working on the project.

## Project Overview

**Name:** Builder's OS (Aura)
**Purpose:** A specialized portfolio platform for builders
**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase

## Architectural Decisions

### Framework & Structure
- **Next.js 14 App Router**: Using modern App Router for better performance and developer experience
- **Bulletproof React Pattern**: Feature-based architecture for long-term maintainability
- **TypeScript Strict Mode**: Zero tolerance for `any` types
- **Supabase**: Backend as a Service for auth, database, and storage

### Folder Structure
```
src/
├── app/                    # Next.js App Router pages
├── components/             # Shared UI components
│   ├── ui/                # Base UI components
│   └── layout/            # Layout components
├── features/              # Feature-based modules (bulletproof pattern)
│   └── [feature]/
│       ├── components/    # Feature-specific components
│       ├── api/          # Server actions
│       ├── hooks/        # Feature hooks
│       ├── types/        # Feature types
│       └── utils/        # Feature utilities
├── lib/                   # Core utilities and external services
│   ├── supabase/         # Supabase client setup
│   └── validations/      # Zod validation schemas
├── types/                 # Shared TypeScript types
├── config/               # Configuration files
├── hooks/                # Shared React hooks
└── utils/                # Shared utility functions
```

## MANDATORY Security Rules (NEVER VIOLATE)

### 1. Security-by-Design
- **ALL user input MUST be validated with Zod schemas** - no exceptions
- Validate on both client and server
- Example schemas: `src/lib/validations/auth.ts`, `src/lib/validations/common.ts`

### 2. SQL Injection Prevention
- Use Supabase parameterized queries ONLY
- Enable Row Level Security (RLS) policies on ALL tables
- NEVER concatenate user input into queries
- Test RLS policies before deploying

### 3. TypeScript Strict Rules
- **NO `any` types allowed** - this is non-negotiable
- Use `unknown` for uncertain types, then narrow with type guards
- Strict mode enabled: `noImplicitAny`, `noImplicitReturns`, `noUnusedLocals`, etc.
- All functions must have explicit return types

### 4. Environment Variables
- NEVER hardcode credentials in code
- Use `.env.local` for local development
- All secrets MUST be documented in `.env.local.example` (with placeholder values)
- Verify `.env*` is in `.gitignore` before EVERY commit

### 5. Authentication Flow
- Supabase handles authentication
- Check auth status in Server Components/Actions using `src/lib/supabase/server.ts`
- Use middleware for session refresh: `src/middleware.ts`
- Client-side auth: use `src/lib/supabase/client.ts`

## Coding Standards

### TypeScript
```typescript
// ✅ GOOD: Explicit types, no 'any'
interface User {
  id: string;
  email: string;
}

async function getUser(id: string): Promise<User | null> {
  // implementation
}

// ❌ BAD: Using 'any'
function getUser(id: any): any {
  // NEVER DO THIS
}
```

### Input Validation
```typescript
// ✅ GOOD: Zod validation
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function signUp(data: unknown) {
  const validated = schema.parse(data); // Throws if invalid
  // Use validated data
}

// ❌ BAD: No validation
async function signUp(data: any) {
  // Using data directly without validation
}
```

### Supabase Client Usage
```typescript
// ✅ GOOD: Server Component
import { createClient } from '@/lib/supabase/server';

async function ServerComponent() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('users').select();
}

// ✅ GOOD: Client Component
'use client';
import { createClient } from '@/lib/supabase/client';

function ClientComponent() {
  const supabase = createClient();
}
```

## ⚠️ PRE-COMMIT SECURITY CHECK (MANDATORY)

**CRITICAL: This check runs BEFORE EVERY commit and CANNOT be bypassed.**

### Automated Security Workflow

Before ANY commit, you MUST run:
```bash
./scripts/security-preflight.sh
```

This script:
- ✅ Scans all staged TypeScript/JavaScript files with Semgrep
- ✅ Detects: XSS risks, hardcoded credentials, weak crypto, missing auth
- ❌ BLOCKS commits if CRITICAL security issues are found
- ✅ Shows detailed findings with fix suggestions
- ✅ Re-scans after fixes to verify resolution

### Security Rules Enforced

1. **XSS Prevention (ERROR)** - `dangerouslySetInnerHTML` requires sanitization
2. **Type Safety (WARNING)** - No `any` types allowed (project policy)
3. **Weak Randomness (WARNING)** - `Math.random()` not allowed for security ops
4. **Missing Auth (WARNING)** - Server actions must check authentication

See `SECURITY_WORKFLOW.md` for complete documentation.

### If Security Check Fails

**DO NOT try to bypass this check. Instead:**
1. Review the security findings shown in terminal
2. Fix ALL critical issues in the reported files
3. Stage your fixes: `git add <file>`
4. Run `./scripts/security-preflight.sh` again
5. Commit only when all critical issues are resolved

### Pre-Commit Checklist

Before committing, verify:
- [x] **Security preflight check passed** (automatic)
- [ ] No `any` types introduced
- [ ] All user input validated with Zod
- [ ] No hardcoded credentials
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] RLS policies tested (if modified database)
- [ ] `.env.local.example` updated (if new env vars added)
- [ ] No sensitive data in logs or comments

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Type checking
npm run type-check       # Check TypeScript types
npm run lint            # Run ESLint
npm run check           # Run both type-check and lint

# Build
npm run build           # Build for production
npm start               # Start production server
```

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Copy project URL and anon key to `.env.local`
3. Generate TypeScript types:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
   ```
4. Enable RLS on all tables
5. Write RLS policies for each table

## Key Files Reference

### Application Code
- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client
- `src/lib/supabase/middleware.ts` - Auth session update logic
- `src/middleware.ts` - Next.js middleware (auth refresh)
- `src/lib/validations/` - Zod validation schemas
- `src/types/database.ts` - Generated Supabase types

### Security & Documentation
- `.semgrep.yml` - **Semgrep security rules** (XSS, auth, type safety, etc.)
- `scripts/security-preflight.sh` - **Pre-commit security check script**
- `SECURITY_WORKFLOW.md` - **Complete security workflow guide**
- `SECURITY.md` - Security guidelines and best practices
- `CLAUDE.md` - This file (architectural decisions and standards)
- `.env.local.example` - Environment variable template

## Dependencies

### Core
- `next` - Next.js 14 framework
- `react`, `react-dom` - React 19
- `typescript` - TypeScript
- `tailwindcss` - Tailwind CSS v4

### Authentication & Database
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Supabase SSR utilities for Next.js

### Validation & Utils
- `zod` - Schema validation
- `clsx`, `tailwind-merge` - Class name utilities

## Future Considerations

### Planned Features
- User authentication flow
- Portfolio project management
- File uploads (images, documents)
- Dark mode support
- Analytics integration

### Performance
- Implement React Server Components where possible
- Use dynamic imports for large components
- Optimize images with next/image
- Enable edge runtime where appropriate

### Testing (TODO)
- Set up Jest for unit tests
- Add Playwright for e2e tests
- Implement RLS policy tests

## Notes for Claude

When working on this project:
1. **Always read this file first** to understand the context
2. **MANDATORY: Run `./scripts/security-preflight.sh` before EVERY commit**
   - This is a hard requirement that CANNOT be bypassed
   - If critical issues found, fix them before committing
   - Never use `--no-verify` or attempt to skip this check
3. **Never compromise on security rules** - they are non-negotiable
4. **Follow the bulletproof pattern** for new features
5. **Update this file** when making significant architectural decisions
6. **Ask clarifying questions** before implementing ambiguous requirements
7. **Check `SECURITY_WORKFLOW.md`** for security scanning details
8. **Check `SECURITY.md`** before implementing auth or data handling features

## Last Updated
2026-02-11 - Added Semgrep security scanning and mandatory pre-commit checks
