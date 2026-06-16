# Data Model: Strapi + Stripe E-commerce Shop

**Phase 1 output for `speckit.plan`**  
**Date**: 2026-06-17 | **Branch**: `001-strapi-stripe-ecommerce`

---

## Strapi Content Types (Persisted)

### Product

Represents a pricing tier. Managed in Strapi Admin.

| Field | Strapi Type | Constraints | Notes |
|---|---|---|---|
| `name` | Short Text | required | e.g. "One-time Lifetime" |
| `slug` | UID (from name) | required, unique | `free` \| `onetime` \| `monthly` \| `annual` |
| `description_en` | Long Text | required | EN marketing copy |
| `description_zh` | Long Text | required | ZH Cantonese marketing copy |
| `features_en` | JSON | required | `string[]` — bullet feature list (EN) |
| `features_zh` | JSON | required | `string[]` — bullet feature list (ZH) |
| `price_display` | Short Text | required | e.g. "HKD 399", "Free" |
| `stripe_price_id` | Short Text | nullable | null for free tier |
| `highlight` | Boolean | default false | true for "One-time" (featured tier) |

**Strapi API endpoint**: `GET /api/products?populate=*`

---

### Licence

Represents a user's paid access grant. Written by webhook handler only.

| Field | Strapi Type | Constraints | Notes |
|---|---|---|---|
| `stripe_customer_id` | Short Text | required, unique | `cus_xxx` from Stripe |
| `email` | Email | required | from `checkout.session.completed` |
| `plan` | Enumeration | required | `onetime` \| `monthly` \| `annual` |
| `purchased_at` | DateTime | required | event timestamp |
| `expires_at` | DateTime | nullable | null = lifetime (onetime), set for subscriptions |
| `magic_token` | Short Text | nullable | hashed; cleared after use |
| `magic_token_expires_at` | DateTime | nullable | cleared after use |

**Strapi API endpoints**:
- `POST /api/licences` — create (webhook, admin token)
- `PUT /api/licences/:id` — update plan/expiry/magic_token (webhook + verify route)
- `GET /api/licences?filters[email][$eq]=...` — lookup by email (recovery flow, admin token)
- `GET /api/licences?filters[stripe_customer_id][$eq]=...` — lookup by customer ID (webhook)

---

## TypeScript Interfaces (Client-side / shared types)

File: `src/types/strapi.ts`

```typescript
export interface StrapiProduct {
  id: number;
  slug: 'free' | 'onetime' | 'monthly' | 'annual';
  name: string;
  description_en: string;
  description_zh: string;
  features_en: string[];
  features_zh: string[];
  price_display: string;
  stripe_price_id: string | null;
  highlight: boolean;
}

export interface StrapiLicence {
  id: number;
  stripe_customer_id: string;
  email: string;
  plan: 'onetime' | 'monthly' | 'annual';
  purchased_at: string; // ISO 8601
  expires_at: string | null;
  magic_token: string | null;
  magic_token_expires_at: string | null;
}
```

---

## TypeScript Interfaces (Tool I/O — Ephemeral, not persisted)

File: `src/types/tool-inputs.ts`

```typescript
export type Language = 'en' | 'zh';
export type Industry = 'finance' | 'tech' | 'retail' | 'others';
export type ServiceType = 'design' | 'coaching' | 'beauty' | 'tutoring' | 'others';
export type PainPoint = 'late_payments' | 'unclear_briefs' | 'ghosting';
export type UserType = 'job_seeker' | 'freelancer';

// Tool A — CV Achievement Rewriter
export interface CVRewriterInput {
  rawText: string;      // max 500 chars
  role: string;         // max 100 chars
  industry: Industry;
  language: Language;
}

export interface CVRewriterOutput {
  rewrites: [string, string, string]; // exactly 3
}

// Tool B — Client SOP Builder
export interface SOPBuilderInput {
  serviceType: ServiceType;
  businessName?: string; // max 100 chars
  painPoint: PainPoint;
  language: Language;
}

export interface FollowUp {
  day: 0 | 1 | 3 | 7;
  channel: 'whatsapp' | 'email' | 'ig';
  message: string;
}

export interface SOPBuilderOutput {
  enquiryReply: string;
  quotationStructure: string;
  followUpSequence: FollowUp[];   // 4 items (day 0/1/3/7)
  onboardingChecklist: string[];  // 5–7 items
}

// Tool C — Weekly Planner
export interface WeeklyPlannerInput {
  goal: string;           // max 200 chars
  userType: UserType;
  hoursAvailable: number; // 1–80
  language: Language;
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayPlan {
  day: DayKey;
  tasks: [string, string, string]; // exactly 3
}

export interface WeeklyPlannerOutput {
  schedule: DayPlan[]; // 7 items
  reflectionPrompts: string[]; // 3 items
}
```

---

## Cookie Schema

### `ck_session` (anonymous free-tier tracker)

Signed JSON payload:
```typescript
interface SessionCookiePayload {
  cv: 0 | 1;       // uses for CV Rewriter
  sop: 0 | 1;      // uses for SOP Builder
  planner: 0 | 1;  // uses for Weekly Planner
}
```
- Format: `base64url(JSON) + "." + HMAC-SHA256(base64url(JSON), COOKIE_SECRET)`
- Max-Age: 30 days

### `ck_access` (paid user access token)

Signed JSON payload:
```typescript
interface AccessCookiePayload {
  email: string;
  plan: 'onetime' | 'monthly' | 'annual';
  iat: number; // issued-at Unix timestamp
}
```
- Format: same HMAC signing as above
- Max-Age: 365 days

---

## State Transitions

### Licence lifecycle
```
[none] 
  --checkout.session.completed--> [active]
  
[active]
  --subscription cancellation--> [expired] (set expires_at = now)
  
[active]  
  --magic link requested--> [active + magic_token set, expires 15m]
  
[active + magic_token]
  --link clicked (verify)--> [active, magic_token cleared]
  
[active + magic_token]
  --15m elapsed--> [active, magic_token expired, cleared on next request]
```

### Free-tier cookie lifecycle
```
[no cookie] --first visit--> [ck_session { cv:0, sop:0, planner:0 }]
[ck_session.cv = 0] --submit CV tool--> [ck_session.cv = 1]
[ck_session.cv = 1] --submit CV tool again--> 422 (upgrade prompt)
```
