# Security Guidelines

## Security-by-Design Principles

This project follows strict security-by-design principles:

### 1. Input Validation
- **ALL** user input MUST be validated using Zod schemas
- Never trust client-side data
- Validate on both client and server
- Example schemas: `src/lib/validations/`

### 2. Authentication & Authorization
- Supabase handles authentication
- Row Level Security (RLS) policies enforce authorization
- Never bypass RLS policies
- Always check auth status in Server Components/Actions

### 3. Environment Variables
- NEVER hardcode credentials
- Use `.env.local` for local development
- Add all secrets to `.env.local.example` (with placeholder values)
- Verify `.env*` is in `.gitignore`

### 4. TypeScript Safety
- No `any` types allowed
- Strict mode enabled
- All functions must have proper type signatures
- Use `unknown` for uncertain types, then narrow with type guards

### 5. SQL Injection Prevention
- Use Supabase's parameterized queries
- Enable RLS policies on all tables
- Never concatenate user input into queries
- Use Zod schemas for query parameters

### 6. Pre-Commit Checklist
Before committing code, verify:
- [ ] No hardcoded credentials
- [ ] No `any` types introduced
- [ ] All user input validated with Zod
- [ ] RLS policies tested
- [ ] Environment variables documented in `.env.local.example`
- [ ] No sensitive data in logs

### 7. Common Vulnerabilities to Prevent
- XSS: React escapes by default, be careful with `dangerouslySetInnerHTML`
- CSRF: Supabase handles CSRF tokens
- SQL Injection: Use Supabase client, enable RLS
- Secrets Exposure: Check `.gitignore`, use env vars
- Insufficient Auth: Always verify auth in server code

## Reporting Security Issues
If you discover a security vulnerability, please report it privately.
