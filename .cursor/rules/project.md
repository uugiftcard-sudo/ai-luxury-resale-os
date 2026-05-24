# Cursor Rules — CLOTH monorepo
# Extends: .cursor/rules/shared.md

# Additional rules specific to the CLOTH luxury fashion marketplace

---

## CLOTH Project Conventions

### Agent tasks (`agent-tasks/`)
- Every agent function (`runSourcingAgent`, `runListingAgent`, etc.) must return a typed `AgentResult`
- Use `console.log` for info, `console.error` for errors — never `console.warn` alone
- Log start/end times and item counts at the agent level
- Agents run per-market (UK, HK, etc.) — always filter data by the market context

### Monorepo structure
- Shared code lives in `packages/` — never duplicate logic across workspaces
- Microservices in `services/` are independent deployables — don't import from `packages/` without a version bump
- API types shared via `@luxury/db` — if you need a new shared type, add it to `@luxury/db` first

### Package exports
- Each `packages/*` must have an explicit `exports` field in `package.json`
- No default exports — prefer named exports for tree-shaking

### API (`api/`)
- REST endpoints return `{ data, error }` envelope shape
- Never expose raw database errors to the client
- Auth middleware on all non-public routes

### Web (`web/`)
- Next.js App Router
- Server Components by default; `"use client"` only when needed
- No inline styles — use Tailwind utility classes or CSS modules

### Database
- Schema changes go through migrations only — no manual DB edits
- All tables have `created_at` and `updated_at` timestamps
- Soft deletes preferred over hard deletes for user data

### Docker
- All services have a `Dockerfile` at their workspace root
- Use `docker-compose.yml` for local development; never commit local-only compose files to main

---

## Agent Skills

All 8 domain agents have dedicated skills. Use them when working on agent tasks:

| Skill | Agent | Trigger |
|-------|-------|---------|
| agent-sourcing | sourcing-agent.ts | Source leads, score products |
| agent-listing | listing-agent.ts | Create listings, Shopify/eBay |
| agent-content | content-agent.ts | Captions, hooks, social copy |
| agent-video | video-agent.ts | Video production plans |
| agent-fulfillment | fulfillment-agent.ts | Packing, shipping checklists |
| agent-community | community-agent.ts | KOC briefs, VIP engagement |
| agent-risk | risk-agent.ts | Counterfeit, compliance checks |
| agent-report | report-agent.ts | Daily report assembly |
