<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Career Kit HK — Agent Instructions

Bilingual (EN / 繁體中文) career & freelance toolkit for Hong Kong professionals. See [PRODUCT_SPEC.md](PRODUCT_SPEC.md) for full feature specs and data models.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint (Next.js core-web-vitals + TypeScript)
```

## Stack

| Layer | Package | Notes |
|---|---|---|
| Framework | **Next.js 16** (`next@16.2.9`) | App Router; README says "14" — ignore it, actual version is 16 |
| UI | **React 19** + **Tailwind CSS v4** | No `tailwind.config.js`; config lives in CSS via `@theme` |
| i18n | **next-intl v4** | Messages in `messages/{en,zh}.json`; locale routing not yet wired. Strapi i18n plugin is the long-term source of truth |
| CMS | **Strapi 5** (Strapi Cloud) | Headless CMS — manages products, pricing copy, i18n content, user licences. API token stored in `STRAPI_API_TOKEN` |
| Payments | **Stripe** | Checkout Sessions + Webhooks (`/api/stripe-webhook`); `stripe` npm package already installed |
| Deploy | Vercel | `Procfile` is Azure App Service fallback, not primary |

Full architecture and required env vars: see [PRODUCT_SPEC.md — Tech Architecture](PRODUCT_SPEC.md).

## Project Structure

```
src/app/             # Next.js App Router (currently scaffold)
messages/            # i18n strings — en.json and zh.json
PRODUCT_SPEC.md      # Feature specs, data models, pricing tiers
```

Planned (not yet created): `src/app/[locale]/` routing, `src/components/`, `src/lib/`, `src/app/api/`.

## Critical Conventions

### Tailwind CSS v4
No `tailwind.config.js`. Customise via `@theme inline { … }` in [`src/app/globals.css`](src/app/globals.css). Use `@import "tailwindcss"` at the top — do **not** use `@tailwind base/components/utilities` directives.

### next-intl v4 Routing
When wiring locale routing, the canonical pattern for next-intl v4 is:
- `src/i18n/routing.ts` — defines `locales` (`['en', 'zh']`) and `defaultLocale`
- `src/middleware.ts` — uses `createNavigation` from `next-intl/navigation`  
- Move pages under `src/app/[locale]/`
- Use `getTranslations()` (Server Components) or `useTranslations()` (Client Components)

Always check `node_modules/next-intl/` docs before writing i18n code — v4 has breaking changes from v3.

### Language Register
`zh.json` uses **Traditional Chinese in Cantonese register** (e.g. "係", "喺", "嘅"). Maintain this register for all ZH copy — do not use Mandarin/Simplified alternatives.

### TypeScript Data Models
Data interfaces for each tool are defined in [PRODUCT_SPEC.md](PRODUCT_SPEC.md). Use them as the source of truth when creating API routes or form state.

### Tools Being Built
Three AI-powered tools (see [PRODUCT_SPEC.md](PRODUCT_SPEC.md)):
1. **CV Achievement Rewriter** — transforms bullet points, outputs 3 rewrites
2. **Client SOP Builder** — generates onboarding templates for freelancers
3. **Weekly Planner** — day-by-day schedule for job seekers / freelancers
