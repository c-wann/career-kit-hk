# Quickstart: Strapi + Stripe E-commerce Shop

**Phase 1 output for `speckit.plan`**  
**Date**: 2026-06-17 | **Branch**: `001-strapi-stripe-ecommerce`

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20.x | `node -v` |
| npm | 10.x | `npm -v` |
| Git | any | `git --version` |
| Stripe CLI | latest | `stripe --version` |
| Strapi Cloud account | — | https://app.strapi.io |
| Resend account | — | https://resend.com |
| OpenAI API key | — | https://platform.openai.com |

---

## 1. Clone and Install

```bash
git clone <repo-url> career-kit-hk
cd career-kit-hk
npm install
# New packages needed:
npm install openai resend jose zod
```

---

## 2. Environment Variables

Create `.env.local` at project root:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_ONETIME=price_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_ANNUAL=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Strapi
STRAPI_URL=https://your-project.strapiapp.com
STRAPI_API_TOKEN=...          # Read-only API token (for frontend ISR fetches)
STRAPI_ADMIN_API_TOKEN=...    # Write-capable API token (webhook + recovery routes ONLY)

# OpenAI
OPENAI_API_KEY=sk-...

# Email (Resend)
RESEND_API_KEY=re_...

# Cookie signing
COOKIE_SECRET=<32+ random hex bytes>    # e.g. openssl rand -hex 32

# Magic link JWT signing
MAGIC_LINK_SECRET=<32+ random hex bytes> # e.g. openssl rand -hex 32
```

> **Security**: Never commit `.env.local`. Confirm `STRAPI_ADMIN_API_TOKEN` and `OPENAI_API_KEY` are absent from client bundles by running `npm run build` and inspecting `.next/static/` for these strings.

---

## 3. Strapi Content Type Setup

Log in to your Strapi Cloud admin panel and create two content types:

### Product Content Type

Navigate to: **Content-Type Builder → Create new collection type → "Product"**

Add fields:
| Field name | Type |
|---|---|
| `name` | Short text |
| `slug` | UID (attached to name) |
| `description_en` | Long text |
| `description_zh` | Long text |
| `features_en` | JSON |
| `features_zh` | JSON |
| `price_display` | Short text |
| `stripe_price_id` | Short text |
| `highlight` | Boolean |

Save → Deploy content type.

Seed 4 records (Free, One-time, Monthly, Annual) via the Content Manager.

### Licence Content Type

Navigate to: **Content-Type Builder → Create new collection type → "Licence"**

Add fields:
| Field name | Type | Notes |
|---|---|---|
| `stripe_customer_id` | Short text | Mark "Unique" |
| `email` | Email | |
| `plan` | Enumeration | Values: `onetime,monthly,annual` |
| `purchased_at` | Datetime | |
| `expires_at` | Datetime | Not required |
| `magic_token` | Short text | Not required |
| `magic_token_expires_at` | Datetime | Not required |

Save → Deploy content type.

### API Token Permissions

In **Settings → API Tokens**:

1. **Read-only token** (`STRAPI_API_TOKEN`):
   - Type: Custom
   - Permissions: `Product: find, findOne` only

2. **Write token** (`STRAPI_ADMIN_API_TOKEN`):
   - Type: Custom
   - Permissions: `Licence: create, find, findOne, update`

---

## 4. Stripe Setup

1. Create products and prices in Stripe Dashboard (or Stripe CLI):
   ```bash
   stripe prices create --unit-amount 39900 --currency hkd --product-data.name "One-time Lifetime"
   stripe prices create --unit-amount 14900 --currency hkd --recurring.interval month --product-data.name "Pro Monthly"
   stripe prices create --unit-amount 129900 --currency hkd --recurring.interval year --product-data.name "Pro Annual"
   ```
2. Copy the resulting `price_...` IDs into `.env.local`

---

## 5. Local Webhook Testing

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Forward Stripe webhooks to localhost
stripe listen --forward-to localhost:3000/api/stripe-webhook
# Copy the webhook signing secret (whsec_...) → STRIPE_WEBHOOK_SECRET in .env.local

# Terminal 3: Trigger a test event
stripe trigger checkout.session.completed
```

---

## 6. Run Dev Server

```bash
npm run dev
# → http://localhost:3000
```

Visit `http://localhost:3000` to see the landing page.

---

## 7. Key File Locations

| Purpose | File |
|---|---|
| Landing page | `src/app/page.tsx` |
| Checkout API | `src/app/api/checkout/[plan]/route.ts` |
| Checkout verify (cookie issue) | `src/app/api/checkout/verify/route.ts` |
| Stripe webhook | `src/app/api/stripe-webhook/route.ts` |
| CV Rewriter tool API | `src/app/api/tools/cv-rewriter/route.ts` |
| SOP Builder tool API | `src/app/api/tools/sop-builder/route.ts` |
| Weekly Planner tool API | `src/app/api/tools/weekly-planner/route.ts` |
| Access recovery (send) | `src/app/api/recover-access/route.ts` |
| Access recovery (verify) | `src/app/api/recover-access/verify/route.ts` |
| Strapi client wrapper | `src/lib/strapiClient.ts` |
| Cookie auth helpers | `src/lib/cookieAuth.ts` |
| Input sanitiser | `src/lib/inputSanitizer.ts` |
| Magic link helpers | `src/lib/magicLink.ts` |
| TypeScript: Strapi types | `src/types/strapi.ts` |
| TypeScript: Tool I/O types | `src/types/tool-inputs.ts` |

---

## 8. Build & Lint

```bash
npm run build   # Production build — check for secret leaks in output
npm run lint    # ESLint (Next.js core-web-vitals + TypeScript)
```
