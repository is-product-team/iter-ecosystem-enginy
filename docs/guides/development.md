# Development Workflow

This guide outlines the standard practices and commands used in the **Iter Ecosystem** to ensure code quality and team coherence.

## 🌿 Branching Strategy

We follow a simplified Git Flow approach. Always create a task-specific branch before starting work.

| Prefix | Use Case | Example |
| :--- | :--- | :--- |
| `feat/` | New features or capabilities. | `feat/add-user-profile` |
| `fix/` | Bug fixes and hotfixes. | `fix/auth-callback-error` |
| `docs/` | Documentation updates. | `docs/update-readme` |
| `refactor/` | Code structure improvements (no logic changes). | `refactor/clean-api-controllers` |

## 🏎️ Turborepo & Monorepo Management

We use **Turborepo** to manage our multi-package architecture. Instead of running commands in subfolders, run them from the root using filters.

### Running a Specific App
To run only the API or the Web UI:
```bash
npx turbo dev --filter=api
npx turbo dev --filter=web
```

### Global Commands
Run these from the root to check the entire ecosystem:
- **Linting**: `npm run lint`
- **Type Checking**: `npm run type-check`
- **Testing**: `npm run test`

## ⌨️ Coding Standards

### TypeScript
- **No `any`**: Use interfaces or types for all data structures.
- **Shared Types**: Use `@iter/shared` for types used in both Backend and Frontend.

### Linting & Formatting
We use ESLint and Prettier. Most IDEs will handle this automatically, but you can run it manually:
```bash
npm run lint -- --fix
```

### Pull Requests
1. Ensure `npm run type-check` passes locally.
2. Link the PR to a relevant **OpenSpec Change** if applicable.
3. Keep PRs focused on a single responsibility.

---

> [!TIP]
> Use the `/opsx-propose` command with **Antigravity** to start a new feature with the correct specifications and tasks.
