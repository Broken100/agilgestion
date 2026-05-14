# Change: Foundation — AG-Ágil Gestión Core Architecture

**Status**: proposed
**Created**: 2026-05-13
**Author**: SDD Orchestrator

---

## Intent

Establish the complete monorepo foundation for AG-Ágil Gestión: a mobile-first, offline-capable business management system for Ecuadorian small businesses, with Clean Architecture ensuring the domain core remains portable, testable, and independent of infrastructure choices.

## Scope

### Included
- **Monorepo scaffold**: pnpm workspaces, Turborepo pipeline, TypeScript strict base config
- **Domain package** (`packages/domain`): Pure business entities, value objects, repository interfaces, and domain services for POS transactions, inventory, invoicing, and multi-tenant business context
- **Infrastructure package** (`packages/infrastructure`): Drizzle ORM schema with Row-Level Security, repository implementations, JWT auth middleware, audit log
- **Shared package** (`packages/shared`): Cross-cutting TypeScript types, Zod validation schemas, DTOs
- **SRI Compliance package** (`packages/sri`): Ecuadorian tax XML generation (XAdES-BES), digital signature, SRI web service client, offline submission queue
- **Web application** (`apps/web`): Next.js 15 App Router with mobile-first POS dashboard, Zustand stores, Tailwind 4 design system

### Explicitly Excluded
- Actual PKCS#12 certificate management (hardware token integration)
- SRI production environment connectivity (requires real RUC and certificates)
- Payment gateway integrations (future change)
- Report generation module (future change)
- Multi-currency support (Ecuador uses USD exclusively)
- User permission/RBAC system (future change, single-owner MVP)

## Architecture Decisions

### ADR-1: Clean Architecture with Strict Boundaries
**Decision**: Four-layer architecture enforced by package dependencies.
**Rationale**: The domain (business rules) MUST survive framework changes. If Next.js is replaced or Drizzle swapped for Prisma, only infrastructure changes. Ecuadorian tax rules change frequently — isolating SRI logic in its own package allows independent compliance updates.
**Constraint**: `packages/domain` has zero runtime dependencies. Not even `zod` — validation schemas live in `shared`.

### ADR-2: PostgreSQL Row-Level Security for Multi-tenancy
**Decision**: Multi-tenancy enforced at database level via RLS policies, NOT application-level WHERE clauses.
**Rationale**: Defense in depth. If a query bug misses a `business_id` filter, RLS blocks the leak. Each tenant's data is isolated by PostgreSQL itself. This is the pattern used by Supabase and recommended for multi-tenant SaaS.
**Trade-off**: Requires `SET app.current_business_id = '...'` on every connection, slightly more complex connection pooling.

### ADR-3: Drizzle ORM over Prisma
**Decision**: Drizzle ORM for database access.
**Rationale**: 
- Zero code generation (no `prisma generate` step)
- Native RLS support via raw SQL policies
- Type-safe without a heavyweight client
- Better Edge/Serverless compatibility (Vercel deployment target)
- Smaller bundle, faster cold starts

### ADR-4: Zustand + Persist for Offline-First
**Decision**: Zustand 5 with `persist` middleware (IndexedDB) for client state.
**Rationale**: POS must work offline. Sales data is queued locally and synced when connectivity returns. Zustand's persist middleware provides this with minimal boilerplate. The store acts as a local cache that survives page reloads.

### ADR-5: Server Components Default, Client Islands
**Decision**: Next.js App Router with Server Components as the default. Client components only for interactivity (POS screen, forms).
**Rationale**: Server Components reduce client JavaScript, improve initial load, and keep sensitive business logic on the server. The POS screen is the primary client-heavy surface.

### ADR-6: SRI as Independent Package
**Decision**: `packages/sri` with zero dependency on `apps/web` or Next.js.
**Rationale**: SRI compliance logic (XML generation, signing, web service calls) must be testable in isolation and potentially reusable in non-Next.js contexts (e.g., background workers, desktop app). The package exports pure functions and services.

## Affected Modules

| Package | Type | Dependencies |
|---------|------|-------------|
| `packages/domain` | Pure TS library | None |
| `packages/shared` | Pure TS library | zod |
| `packages/infrastructure` | TS library | domain, shared, drizzle-orm, pg, jose |
| `packages/sri` | TS library | domain, shared, xml-crypto, node-forge |
| `apps/web` | Next.js app | domain, shared, infrastructure, sri, ui |

## Dependency Graph
```
apps/web ───────────┐
  │                 │
  ├── packages/domain
  ├── packages/shared
  ├── packages/infrastructure ──├── packages/domain
  │                             └── packages/shared
  ├── packages/sri ────────────├── packages/domain
  │                             └── packages/shared
  └── packages/ui (optional)
```

## Rollback Plan

This is a greenfield change. There is nothing to roll back. The risk is in the architecture decisions themselves — if a decision proves wrong (e.g., Drizzle doesn't scale), it would require a new change to migrate. Mitigation: each package is independently replaceable due to Clean Architecture boundaries.

## Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| SRI XML spec incomplete | High | Medium | Isolate in `packages/sri`, use test XML fixtures from SRI documentation |
| RLS performance with many tenants | Medium | Low | PostgreSQL RLS is well-optimized; add connection pool tuning later |
| Drizzle ORM maturity for complex queries | Medium | Low | Drizzle has raw SQL escape hatch; domain interfaces abstract the ORM |
| Offline sync conflicts | High | Medium | Last-write-wins with audit log; conflict resolution in future change |
| Tailwind 4 breaking changes in patch | Low | Medium | Pin exact version in root package.json |

## Next Recommended

Proceed to `sdd-spec` and `sdd-design` in parallel (both depend on this proposal).
