# 📋 Product Specification — Career Kit HK

## Overview
A bilingual (EN/繁中) web-based toolkit sold via **Stripe**, content managed via **Strapi headless CMS**, deployed on Vercel.

---

## Tool A: CV Achievement Rewriter

### Purpose
Transform weak CV bullet points into strong achievement statements.

### Input Fields
| Field | Type | Description |
|-------|------|-------------|
| `raw_achievement` | textarea | User's original bullet point |
| `role` | text | Job title / role |
| `industry` | select | Finance / Tech / Retail / Others |
| `language` | toggle | EN / ZH |

### Output
- 3 rewritten versions with measurable impact
- Format: "Action verb + What you did + Result/Impact"
- Example: "Led 5-person team to launch product → on time, 20% under budget"

### Data Model
```typescript
interface CVAchievement {
  id: string
  rawText: string
  role: string
  industry: string
  language: 'en' | 'zh'
  rewrites: string[]  // 3 generated versions
  createdAt: Date
}
```

---

## Tool B: Client SOP Builder (Freelancer)

### Purpose
Generate a tailored client onboarding SOP + follow-up sequence.

### Input Fields
| Field | Type | Description |
|-------|------|-------------|
| `service_type` | select | Design / Coaching / Beauty / Tutoring / Others |
| `business_name` | text | Optional branding |
| `language` | toggle | EN / ZH |
| `pain_point` | select | Late payments / Unclear briefs / Ghosting |

### Output
- WhatsApp/IG DM reply template (enquiry stage)
- Quotation structure (3 pricing tiers)
- Follow-up sequence: Day 0 / 1 / 3 / 7
- New client onboarding checklist (5–7 items)

### Data Model
```typescript
interface ClientSOP {
  id: string
  serviceType: string
  businessName?: string
  language: 'en' | 'zh'
  painPoint: string
  templates: {
    enquiryReply: string
    quotationStructure: string
    followUpSequence: FollowUp[]
    onboardingChecklist: string[]
  }
  createdAt: Date
}

interface FollowUp {
  day: number
  channel: 'whatsapp' | 'email' | 'ig'
  message: string
}
```

---

## Tool C: Weekly Planner (Job Seeker / Freelancer)

### Purpose
Generate a personalized weekly action plan with goal tracking.

### Input Fields
| Field | Type | Description |
|-------|------|-------------|
| `goal` | text | e.g. "Apply to 5 jobs this week" |
| `user_type` | select | Job Seeker / Freelancer |
| `hours_available` | number | Hours per week |
| `language` | toggle | EN / ZH |

### Output
- Day-by-day schedule (Mon–Sun)
- 3 priority tasks per day
- End-of-week reflection prompts

---

## Pricing Structure

| Tier | Price | Access |
|------|-------|--------|
| Free Preview | HKD 0 | 1 use per tool |
| One-time | HKD 399 | Unlimited, lifetime |
| Pro Monthly | HKD 149/mo | All tools + future updates |
| Pro Annual | HKD 1,299/yr | Best value |

---

## Tech Architecture

### Stack
| Layer | Choice | Notes |
|---|---|---|
| Frontend | **Next.js 16** (Vercel) | App Router, React 19 |
| CMS | **Strapi 5** (Strapi Cloud) | Headless; manages products, pricing copy, i18n content, user licences |
| Payments | **Stripe** | Checkout Sessions + Webhooks; Price IDs stored in Strapi or env vars |
| AI | OpenAI API | Used by all three tool API routes |
| Auth / Access | Stripe webhook → Strapi Users | On `checkout.session.completed`, create/update Strapi user with purchased plan |

### Request Flow

```
User → Next.js (Vercel)
    ├─ GET /api/checkout/[plan]  → Stripe Checkout Session → stripe.com
    │                                      ↓ (on success)
    │                             Stripe Webhook (POST /api/stripe-webhook)
    │                                      ↓
    │                             Strapi REST API  → create/update user + licence
    │
    ├─ Tool pages  → /api/tools/[tool]  → OpenAI API  → streamed response
    │
    └─ Content     → Strapi REST/GraphQL → product names, pricing copy, i18n strings
```

### Strapi Content Types
```
Product          – name, slug, description (EN/ZH), features[], price, stripePrice Id
Licence          – userId, plan, purchasedAt, expiresAt (null = lifetime)
User (extended)  – email, stripeCustomerId, licences[]
```

### Strapi → Next.js Integration
- Fetch product/pricing content from Strapi at build time (`generateStaticParams`) or with ISR
- Use Strapi's built-in i18n plugin for EN/ZH content variants
- Strapi Admin Panel replaces hard-coded copy in `page.tsx` — editors can update pricing without a redeploy

### Environment Variables Required
```
STRAPE_SECRET_KEY            # Stripe secret key
STRIPE_WEBHOOK_SECRET        # Stripe webhook signing secret
STRIPE_PRICE_ID_ONETIME      # Stripe Price ID for one-time plan
STRIPE_PRICE_ID_MONTHLY      # Stripe Price ID for monthly plan
STRIPE_PRICE_ID_ANNUAL       # Stripe Price ID for annual plan
NEXT_PUBLIC_STRIPE_KEY       # Stripe publishable key (optional, for Stripe.js)
STRAPI_URL                   # e.g. https://your-project.strapiapp.com
STRAPI_API_TOKEN             # Strapi API token (read-only for frontend)
STRAPI_ADMIN_API_TOKEN       # Strapi API token (write, for webhook handler)
NEXT_PUBLIC_APP_URL          # e.g. https://career-kit-hk.vercel.app
```
