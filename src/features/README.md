# Features

Feature-based modules following the bulletproof React pattern.

Each feature should contain:
- `components/` - Feature-specific components
- `api/` - API routes or server actions
- `hooks/` - Feature-specific hooks
- `types/` - Feature-specific types
- `utils/` - Feature-specific utilities

Example feature structure:
```
features/
  auth/
    components/
      LoginForm.tsx
      SignupForm.tsx
    api/
      actions.ts
    hooks/
      useAuth.ts
    types/
      index.ts
```
