# Design: Professional Documentation Restructure

## Context

The current `docs/` folder contains a mix of Spanish and English documents, some of which are outdated. Specifically, the "Getting Started" guide is too dense, and there is no clear documentation on the system's role-based access control (RBAC) despite having a rich seeding strategy.

## Goals / Non-Goals

**Goals:**
- **Coherence**: Establish a clear hierarchy between onboarding guides and technical references.
- **English-First**: Ensure 100% English documentation for institutional professionalism.
- **Actionable Info**: Provide exact login examples from the seed data.
- **Simplified Setup**: Streamline the installation process into readable steps.

**Non-Goals:**
- Modifying any application logic or source code outside `docs/`.
- Implementing automated documentation site tools (like Docusaurus) in this phase.
- Documenting every single internal function/helper (stay high-level).

## Decisions

### 1. Folder Structure Organization
We will adopt a structure that separates **how-to** (Guides) from **what-is** (Architecture):

```text
docs/
├── guides/                # Procedural - How to achieve tasks
│   ├── getting-started.md # Installation & Docker
│   ├── auth-and-roles.md  # RBAC & Seed Login Examples
│   └── development.md     # Branch naming, Linting, Turbo commands
├── architecture/          # Structural - Reference & Concepts
│   ├── system-overview.md # Monorepo & Service Map
│   └── data-model.md      # Prisma schema & ERD
└── index.md               # Entry Point
```

### 2. Login Documentation (Seed Integration)
The `auth-and-roles.md` file will map the types defined in `@iter/shared` (ADMIN, COORDINATOR, TEACHER) to the exact emails generated in `prisma/seed.ts`.

### 3. Translation Strategy
All existing Spanish content in `architecture/system-overview.md` or `guides/getting-started.md` will be fully translated to professional English.

## Risks / Trade-offs

- **Redundancy**: Some information might be duplicated between README and Docs; we will prioritize the `docs/` folder as the source of truth for deep technical info.
- **Drift**: Documentation may go out of sync with seed data if the seed changes; we will emphasize that examples are based on the latest seed.
