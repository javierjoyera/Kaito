# Project Context — Kaito

Kaito is an AI-assisted training-planning web application for Trail and Ultra Trail runners. The current MVP combines deterministic training policies with a bounded OpenAI generation boundary.

## Current implementation

- Modular monorepo with `apps/web`, `apps/api`, and the reserved `packages/api-client` placeholder.
- `apps/web`: Next.js 16.2.10, React 19.2.0, TypeScript 5.9.3, Supabase SSR/Auth, Sentry, and Playwright.
- `apps/api`: Python 3.12, FastAPI 0.115.6, SQLAlchemy, PostgreSQL via Supabase, OpenAI SDK 2.46.0, Sentry, pytest, and Ruff.
- Delivered product capabilities include Supabase registration/login, protected routes, a persistent seven-step onboarding flow, deterministic training-approach eligibility, synchronous plan generation, atomic active-plan persistence, and active-plan dashboard/calendar views.
- CI is defined in `.github/workflows/ci.yml` and exercises web checks, API checks, image builds, Playwright, and local Supabase RLS integration tests.

## Architecture and ownership conventions

- The repository is a modular monorepo, not a microservice system.
- `apps/web/app/` owns Next.js routing and orchestration only. Product behavior belongs under `apps/web/features/<capability>/`.
- Existing web capabilities are `auth`, `onboarding`, `planning`, and `product-routing`.
- Frontend `shared/` promotion requires at least two distinct real feature consumers. Do not create speculative shared abstractions, generic `utils`/`helpers`, empty future-feature folders, or mechanical container components.
- Supabase web clients are owned by `apps/web/features/auth/_infrastructure/supabase/`; authenticated fetch is owned by `apps/web/features/auth/_adapters/`.
- The backend is a pragmatic modular monolith. Current modules are `auth`, `runner_profile`, `planning`, and controlled shared domain code.
- Supabase CLI migrations are the physical schema and RLS authority. SQLAlchemy owns runtime persistence. The authenticated owner must be derived from verified JWT claims, never trusted from client input.
- OpenAI is a proposal boundary; deterministic Kaito policies retain authority over eligibility, generation context, validation, and persistence.

## SDD configuration for this session

- Execution mode: interactive.
- Artifact store: both OpenSpec files and Engram memory.
- Chained PR strategy: ask before every chained-PR decision.
- Review budget: 800 authored changed lines.
- Issue #119 (`validate-goal-target-date`) is an independent change; no proposal or implementation artifact was created during initialization.
- `Europe/Madrid` is the canonical timezone for deciding whether a goal target date is strictly later than today.
- Strict TDD: enabled. Implementation phases must use RED, GREEN, TRIANGULATE, and REFACTOR with evidence from the narrowest relevant runner before broader verification.
- Proposal, spec, design, tasks, apply, verify, and archive remain separate gated phases. This initialization created no change and performed no implementation.
- Existing non-archived directories under `openspec/changes/` were preserved unchanged; the next orchestration step must select a new change name explicitly and must not infer that an older directory belongs to the requested seven improvements.

## Testing capabilities

Strict TDD is supported and required because concrete test layers exist and are exercised by CI.

### Web and repository checks

- Node.js test runner through `tsx` for feature and contract tests.
- Root portable-path contract: `pnpm test:portable-paths`.
- Web contracts: `pnpm test:web-sentry-scrubbing`, `pnpm test:web-auth`, `pnpm --filter web test:health`, and `pnpm test:web-onboarding`.
- Static/build checks: `pnpm lint:web` and `pnpm build:web`.
- Browser E2E: `pnpm test:web-e2e`, covering development and production Next.js configurations with Playwright Chromium.
- Container check: `pnpm test:web-docker-build`; CI also builds Railway images.

### API and persistence checks

- Lint: `cd apps/api && uv run ruff check .`.
- Fast tests: `cd apps/api && uv run pytest tests/ --ignore=tests/integration`.
- Integration: local Supabase plus `cd apps/api && uv run pytest tests/integration -q`.
- FastAPI `TestClient`, SQLAlchemy tests, and owner/RLS proofs are present.
- `pyrightconfig.json` exists, but no executable Pyright command is configured.
- No coverage reporter, command, threshold, or repository formatter is configured.

### Initialization evidence

- Local Node.js is v24.18.0 and satisfies the declared `>=24.18 <25` range.
- pnpm 11.0.0 is available directly and through Corepack.
- uv 0.11.29 is available; API commands use uv-managed Python 3.12 even though the system `python3` is 3.9.6.
- The portable-path suite passed 25 tests.
- pytest collected 748 non-integration API tests.
- Playwright listed 85 development-configuration tests across 9 files.
- Full API, browser, build, Docker, and Supabase integration suites were not executed during initialization.

## Documentation and delivery conventions

- Product and TFM documents under `docs/` are primarily Spanish.
- Technical artifacts default to English unless extending an existing Spanish document.
- Branch names use lowercase English words separated by hyphens.
- Commits use Conventional Commits in English and never include AI attribution.
- Tracked documentation and SDD artifacts must use repository-relative paths and must not contain personal or machine-specific absolute paths.
- A completed change must review the root `README.md`; update it when capabilities, setup, environment variables, architecture/runtime behavior, developer commands, or verification flow change.

## Primary references

- `README.md`
- `docs/00-product-vision.md`
- `docs/04-functional-requirements.md`
- `docs/05-data-model.md`
- `docs/06-ai-behavior.md`
- `docs/07-training-knowledge.md`
- `docs/08-architecture.md`
- `.github/workflows/ci.yml`
- `package.json`
- `apps/web/package.json`
- `apps/api/pyproject.toml`
