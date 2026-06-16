# Implementation Plan: Strapi + Stripe E-commerce Shop

**Branch**: `001-strapi-stripe-ecommerce` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-strapi-stripe-ecommerce/spec.md`

## Summary

Build a bilingual (EN/ZH) SaaS shop for Career Kit HK using Stripe for payments, Strapi 5 as headless CMS, and OpenAI for three AI career tools. The system uses HTTP-only cookies for access control (no login), email magic links for access recovery, and ISR (60s TTL) for Strapi-managed content. Replace the existing flat-file `licenseStore.ts` with Strapi REST API calls. Add three dedicated server-side tool routes with input sanitisation and per-tool free-tier enforcement.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js 20 (Vercel serverless), Next.js 16.2.9 (App Router)  
**Primary Dependencies**: `next@16`, `react@19`, `tailwindcss@4` (CSS-only config), `next-intl@4`, `stripe`, `openai` (add), `resend` (add), `jose` (add), `zod` (add)  
**Storage**: Strapi 5 (Strapi Cloud) — `Product` and `Licence` content types; no local file DB in production  
**Testing**: ESLint (`next/core-web-vitals` + TypeScript strict) + manual acceptance test per SC-001–SC-007; no automated test suite for MVP  
**Target Platform**: Vercel (serverless Node.js runtime), Strapi Cloud  
**Project Type**: Web service / SaaS (Next.js App Router, B2C, Cantonese HK market)  
**Performance Goals**: Tool output ≤15s (FR-012); landing page ISR ≤60s TTL (FR-009); Checkout to redirect <3 min (SC-001)  
**Constraints**: Zero secrets in client bundles (SC-006); no login/session system (HTTP-only cookies only); cookie-only paid-user identification; Cantonese Traditional Chinese ZH register  
**Scale/Scope**: Single-region Vercel deployment; ~4 Stripe products; 2 Strapi content types; 3 AI tool routes; ~8 API routes total

## Constitution Check

*The project constitution has not yet been customised (blank template). No constitution-level violations to gate on. Proceeding with spec-derived principles:*

| Principle | Status | Notes |
|---|---|---|
| No secrets in client bundles (SC-006) | ✅ PASS | All AI/CMS/payment calls are server-side routes only |
| No login/session system for MVP | ✅ PASS | Cookie-only access enforcement; no auth library |
| Simplicity / YAGNI | ✅ PASS | No streaming (deferred), no on-demand ISR, no Moderation API |
| ZH = Cantonese Traditional Chinese register | ✅ PASS | Enforced in prompts and copy (FR-007) |
| `licenseStore.ts` is temporary | ✅ PASS | Will be replaced by Strapi API calls in this feature |

*Re-check after Phase 1: no new violations introduced by design decisions.*

## Project Structure

### Documentation (this feature)

```text
specs/001-strapi-stripe-ecommerce/
├── plan.md              # This file (speckit.plan output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
├── contracts/
│   └── api-routes.md    # Phase 1 output ✅
├── checklists/
│   └── requirements.md  # Quality checklist (speckit.specify output)
└── tasks.md             # Phase 2 output (speckit.tasks — NOT created by speckit.plan)
```

### Source Code Layout

```text
src/
├── app/
│   ├── globals.css                          # Tailwind v4 (@import + @theme inline)
│   ├── layout.tsx                           # Root layout
│   ├── page.tsx                             # Landing page — update to fetch from Strapi ISR
│   ├── deliver/
│   │   └── page.tsx                         # NEW: post-Stripe success page (calls /api/checkout/verify)
│   ├── recover/
│   │   └── page.tsx                         # NEW: email input form → POST /api/recover-access
│   ├── tools/
│   │   ├── cv-rewriter/page.tsx             # NEW: CV Achievement Rewriter UI
│   │   ├── sop-builder/page.tsx             # NEW: SOP Builder UI
│   │   └── weekly-planner/page.tsx          # NEW: Weekly Planner UI
│   └── api/
│       ├── checkout/
│       │   ├── [plan]/route.ts              # EXISTING — no change
│       │   └── verify/route.ts              # NEW: verify Stripe session → set ck_access cookie
│       ├── stripe-webhook/route.ts          # EXISTING — replace licenseStore → Strapi API
│       ├── tools/
│       │   ├── cv-rewriter/route.ts         # NEW
│       │   ├── sop-builder/route.ts         # NEW
│       │   └── weekly-planner/route.ts      # NEW
│       └── recover-access/
│           ├── route.ts                     # NEW: POST — send magic link email
│           └── verify/route.ts             # NEW: GET — consume token → set ck_access cookie
├── lib/
│   ├── licenseStore.ts                      # EXISTING → DELETE after migrating to Strapi
│   ├── strapiClient.ts                      # NEW: typed Strapi REST helpers
│   ├── cookieAuth.ts                        # NEW: HMAC sign/verify for ck_access + ck_session
│   ├── inputSanitizer.ts                    # NEW: prompt injection guard + length validation
│   └── magicLink.ts                         # NEW: jose JWT sign/verify for magic links
└── types/
    ├── strapi.ts                            # NEW: StrapiProduct, StrapiLicence interfaces
    └── tool-inputs.ts                       # NEW: CVRewriterInput/Output, SOPBuilderInput/Output, etc.
```

**Structure Decision**: Single Next.js App Router project (Option 1). No separate backend — all server logic lives in App Router Route Handlers. Strapi is external (Strapi Cloud). No monorepo needed.

## Complexity Tracking

No constitution violations requiring justification. The complexity of having 8 API routes and 2 new lib modules is proportional to the feature requirements (3 AI tools + payment + access recovery).
