# Citation Manager — Citation Management SaaS

Manage business citations across 958+ online directories. A modern, API-first alternative to Uberall, BrightLocal, and Yext.

## Status

> **Honesty:** Stripe billing is **not** implemented. Pricing tiers below are planned targets only. Do not treat them as live checkout.


**Phase 2A: 100% Complete ✅** — API Integrations (Google, Yelp, Facebook) shipped with rate limiting, retry logic, and full test suite. 958-directory registry loaded. Ready for Phase 2B manual testing.

**Latest:** Phase 2A shipped 2026-04-01 ([Issue #12](https://github.com/michaelmonetized/citation-manager/issues/12), [Issue #15](https://github.com/michaelmonetized/citation-manager/issues/15))

See [GitHub Issues](https://github.com/michaelmonetized/citation-manager/issues) and [Issue #17](https://github.com/michaelmonetized/citation-manager/issues/17) for status.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind v4
- **Authentication:** Convex Auth (passwordless signup/login)
- **Backend:** Convex (multi-tenant, real-time)
- **Infrastructure:** Vercel, Convex Cloud
- **Payments:** Stripe — **planned (Phase 4)**; not wired at HEAD (no Stripe dependency or keys)
- **Analytics / error tracking:** Not wired (no PostHog/Sentry integration)

## Quick Start

```bash
# Setup
cp .env.example .env.local
# Add NEXT_PUBLIC_CONVEX_URL to .env.local
bun install

# Development
bun run dev
# Open http://localhost:3000
# Sign up with your email
# Create location and test submissions
```

## Architecture

- **Multi-tenant:** Each client manages their own locations and submissions
- **Locations:** Store NAP (Name, Address, Phone) + website + hours + category
- **Submissions:** Track which directories each location was submitted to
- **Integrations:** API-based + form automation (Playwright for legacy sites)
- **Queue system:** Rate-limit submissions to respect directory API limits

## Roadmap

### Phase 1: MVP (100% Done ✅)

- [x] Convex Auth (signup/login)
- [x] Client dashboard + location CRUD
- [x] Company profile form
- [x] Submission tracking schema
- [x] Google Business Profile integration
- [x] Yelp Business API integration
- [x] Facebook Graph API integration
- [x] Directory registry (958 directories loaded)

### Phase 2A: API Integrations (100% Done ✅ — 2026-04-01)

- [x] Google Business Profile (auto-submit + verification polling)
- [x] Yelp Business API (search + create/update)
- [x] Facebook Graph API (page creation + Instagram linking)
- [x] Rate limiting (10 req/min, exponential backoff)
- [x] Retry logic (auto-recovery, 3 attempts)
- [x] 958 directory registry (searchable, ranked by traffic)
- [x] Comprehensive test suite (15 test cases)

### Phase 2B: UI Wiring & Testing (Current — 2026-04-01 to 04-04)

- [ ] Manual smoke test (5+ submissions per API)
- [ ] Frontend integration (wire API routes to UI)
- [ ] Staging environment validation
- [ ] Production deploy readiness check

### Phase 2C: Advanced Integrations (Planned — Week 2-3)

- [ ] LinkedIn Company API
- [ ] Bing Places API
- [ ] Apple Maps Business Registration
- [ ] Form automation for legacy directories (Playwright)
- [ ] Real-time submission status tracking (WebSocket)
- [ ] NAP consistency auditing

### Phase 3: Scale & Polish (2-3 weeks)

- [ ] 100+ directory integrations
- [ ] Advanced analytics (coverage %, consistency %, visibility impact)
- [ ] Automated review collection
- [ ] Customer support tools
- [ ] Production security audit

### Phase 4: Monetization (Planned — Stripe not started)

- [ ] Stripe integration (subscription billing) — roadmap only, not claimed as shipped
- [ ] Freemium model (2 locations free, $99/mo for unlimited)
- [ ] API access for partners
- [ ] Marketplace (partner integrations)

## Planned pricing (Stripe not wired — aspirational only)

- **Starter:** Free, 1 location, 50 submissions/month (popular directories only)
- **Professional:** $99/month, 5 locations, unlimited submissions to 500+ directories
- **Business:** $299/month, unlimited locations, advanced analytics + priority support
- **Enterprise:** Custom pricing, dedicated integrations, white-label option

## Revenue Model

- **Target:** 100 agencies @ $100-500/month per client location = $50K+/month MRR
- **Opportunity:** Replace $500-2000/month BrightLocal/Yext subscriptions with $99 alternative
- **Moat:** Proprietary integrations to directories with restricted API access

## Development

### Environment Setup

```bash
# Copy example env file
cp .env.example .env.local

# Add required credentials to .env.local:
# - NEXT_PUBLIC_CONVEX_URL: Get from npx convex dev
# - Convex auth is handled automatically via Convex Cloud
```

### Available Commands

```bash
# Development
bun run dev              # Start Next.js + Convex dev
npx convex dev          # Convex backend + type generation
npm run build           # Production build
npm run lint            # Run linter (oxlint)
npm run type-check      # TypeScript strict mode check

# Database
npx convex push         # Deploy Convex schema to cloud
npx convex pull         # Pull latest schema from cloud
convex/seed.ts          # See example seed mutations
```

### Project Structure

```
citation-manager/
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth pages (signup, login)
│   ├── (protected)/       # Protected routes (require login)
│   │   ├── dashboard/     # Client dashboard
│   │   ├── locations/     # Location management
│   │   └── submissions/   # Submission tracking
│   └── page.tsx           # Landing page
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # Authentication queries/mutations
│   ├── locations.ts       # Location CRUD
│   ├── submissions.ts     # Submission tracking
│   ├── integrations/      # Directory API integrations
│   │   ├── googleBusiness.ts
│   │   ├── brightlocal.ts (TODO)
│   │   └── ...
│   ├── seedDirectories.ts # Directory registry setup
│   └── _generated/        # Auto-generated Convex types
├── data/                  # Static data
│   └── directories.json   # 958 directory registry + API metadata
├── lib/                   # Utilities
│   ├── auth.ts            # Auth helpers
│   ├── convex.ts          # Convex client setup
│   └── types.ts           # TypeScript types
└── components/            # React components
    ├── auth/              # Auth forms
    ├── layouts/           # Page layouts
    └── ui/                # Reusable UI components
```

### Key Files

- **`convex/schema.ts`** — Database schema (clients, locations, directories, submissions, credentials)
- **`data/directories.json`** — Registry of 958+ directories with API metadata
- **`convex/integrations/`** — Directory API implementations (plug-in new ones here)
- **GitHub Issues** — Detailed task breakdown and acceptance criteria

### Testing Locally

1. Sign up at `http://localhost:3000/signup`
2. Create a location: Navigate to Dashboard → Locations → Add Location
3. Submit to directories: Dashboard → Locations → Select location → Submit
4. Track submissions: View submission status in real-time

### Debugging

```bash
# View Convex console logs
npx convex logs

# Check Convex database state
npx convex query

# Reset local Convex data (careful!)
rm -rf .convex/
npx convex dev
```

## Blockers & Next Steps

See [COMPLETED-YYYY-MM-DD.md](../COMPLETED-2026-03-24.md) for current blockers and recommendations.
