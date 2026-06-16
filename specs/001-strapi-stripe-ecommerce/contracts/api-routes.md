# API Route Contracts

**Phase 1 output for `speckit.plan`**  
**Date**: 2026-06-17 | **Branch**: `001-strapi-stripe-ecommerce`

All routes are Next.js App Router Route Handlers (`src/app/api/`).  
All server-side routes use `export const runtime = 'nodejs'`.  
All `POST` bodies are `application/json` unless noted.

---

## Existing Routes (Modify)

### `GET /api/checkout/[plan]`

**File**: `src/app/api/checkout/[plan]/route.ts` (existing — minimal change)

**Change required**: None to the checkout creation logic. The success URL already points to `/deliver?session_id={CHECKOUT_SESSION_ID}`. No modification needed.

| Param | Type | Values |
|---|---|---|
| `plan` (path) | string | `onetime` \| `monthly` \| `annual` |

**Response 302**: Redirect to Stripe Checkout URL  
**Response 400**: `{ error: 'Invalid plan' }`  
**Response 500**: `{ error: 'Missing STRIPE_SECRET_KEY' }` or missing Price ID

---

### `POST /api/stripe-webhook`

**File**: `src/app/api/stripe-webhook/route.ts` (existing — replace licenseStore calls with Strapi API calls)

**Input**: Raw body (Stripe event), `stripe-signature` header  
**Required env**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRAPI_URL`, `STRAPI_ADMIN_API_TOKEN`

**Behaviour on `checkout.session.completed`**:
1. Verify signature → 400 on failure
2. Extract `customerId`, `email`, `plan` from session
3. `GET /api/licences?filters[stripe_customer_id][$eq]={customerId}` → check if exists
4. If not found: `POST /api/licences` with full payload
5. If found: `PUT /api/licences/:id` with updated `plan`, `purchased_at`
6. Return `{ received: true }`

**Response 200**: `{ received: true, type: string }`  
**Response 400**: Signature failure  
**Response 500**: Missing env vars

---

## New Routes

### `GET /api/checkout/verify`

**File**: `src/app/api/checkout/verify/route.ts` (NEW)

Purpose: Called by the `/deliver` page after Stripe redirect. Verifies the checkout session completed and issues the `ck_access` cookie.

| Query param | Type | Notes |
|---|---|---|
| `session_id` | string | Stripe Checkout Session ID |

**Required env**: `STRIPE_SECRET_KEY`, `COOKIE_SECRET`

**Behaviour**:
1. Retrieve session from Stripe API
2. Verify `payment_status === 'paid'` or `status === 'complete'`
3. Extract `customer_email` and `metadata.plan`
4. Sign and set `ck_access` cookie (`httpOnly: true`, `secure: true`, `sameSite: 'lax'`, `maxAge: 31536000`)
5. Return 200

**Response 200**: `{ ok: true, plan: string }`  
**Response 400**: `{ error: 'Session not completed' }`  
**Response 500**: Missing env / Stripe error

---

### `POST /api/tools/cv-rewriter`

**File**: `src/app/api/tools/cv-rewriter/route.ts` (NEW)

**Rate limit**: 10 requests/min per IP (middleware or in-route counter — implementation detail)  
**Auth**: Reads `ck_access` or `ck_session` cookie to enforce access tier

**Request body**:
```json
{
  "rawText": "string (required, max 500)",
  "role": "string (required, max 100)",
  "industry": "finance | tech | retail | others",
  "language": "en | zh"
}
```

**Behaviour**:
1. Validate body with Zod schema → 422 on failure
2. `sanitizeInput()` → 422 on injection/length violation  
3. Check `ck_access` cookie → if valid, allow; if invalid/absent, check `ck_session.cv`
4. If free-tier used: 402 `{ error: 'Upgrade required' }`
5. Call OpenAI → parse 3 rewrites from response
6. If free-tier success: increment `ck_session.cv = 1` in response cookie
7. Return output

**Response 200**:
```json
{ "rewrites": ["string", "string", "string"] }
```
**Response 402**: `{ error: 'Upgrade required', upgradeUrl: '/#pricing' }`  
**Response 422**: `{ error: 'Input rejected', reason: string }`  
**Response 500**: `{ error: 'Generation failed' }` (never surfaces raw OpenAI error)

---

### `POST /api/tools/sop-builder`

**File**: `src/app/api/tools/sop-builder/route.ts` (NEW)

Same auth + sanitisation pattern as cv-rewriter. Checks `ck_session.sop`.

**Request body**:
```json
{
  "serviceType": "design | coaching | beauty | tutoring | others",
  "businessName": "string (optional, max 100)",
  "painPoint": "late_payments | unclear_briefs | ghosting",
  "language": "en | zh"
}
```

**Response 200**:
```json
{
  "enquiryReply": "string",
  "quotationStructure": "string",
  "followUpSequence": [
    { "day": 0, "channel": "whatsapp", "message": "string" },
    { "day": 1, "channel": "whatsapp", "message": "string" },
    { "day": 3, "channel": "email",    "message": "string" },
    { "day": 7, "channel": "email",    "message": "string" }
  ],
  "onboardingChecklist": ["string", "string", "string", "string", "string"]
}
```
**Response 402/422/500**: same pattern as cv-rewriter

---

### `POST /api/tools/weekly-planner`

**File**: `src/app/api/tools/weekly-planner/route.ts` (NEW)

Same auth + sanitisation pattern. Checks `ck_session.planner`.

**Request body**:
```json
{
  "goal": "string (required, max 200)",
  "userType": "job_seeker | freelancer",
  "hoursAvailable": "number (1–80)",
  "language": "en | zh"
}
```

**Response 200**:
```json
{
  "schedule": [
    { "day": "mon", "tasks": ["string", "string", "string"] },
    { "day": "tue", "tasks": ["string", "string", "string"] },
    "... (7 days)"
  ],
  "reflectionPrompts": ["string", "string", "string"]
}
```
**Response 402/422/500**: same pattern

---

### `POST /api/recover-access`

**File**: `src/app/api/recover-access/route.ts` (NEW)

**Request body**:
```json
{ "email": "string (required, valid email format)" }
```

**Behaviour**:
1. Validate email format (Zod)
2. Lookup Licence in Strapi by email (admin token)
3. If not found: return 200 with generic message (no enumeration of registered emails)
4. Generate JWT with `jose`: `{ email }`, signed `HS256`, `exp: 15m`
5. Store HMAC hash of JWT (not raw JWT) in `licence.magic_token`; set `magic_token_expires_at`
6. PATCH Strapi Licence record
7. Send email via Resend with magic link URL: `{APP_URL}/api/recover-access/verify?token={jwt}`
8. Return 200

**Response 200**: `{ message: 'If an account exists, a recovery email has been sent.' }`  
**Response 422**: `{ error: 'Invalid email' }`  
**Response 500**: Email send failure (log server-side, return generic 500)

---

### `GET /api/recover-access/verify`

**File**: `src/app/api/recover-access/verify/route.ts` (NEW)

| Query param | Type | Notes |
|---|---|---|
| `token` | string | JWT from magic link email |

**Behaviour**:
1. Verify JWT signature and expiry with `jose` → 400 if invalid/expired
2. Extract `email` from JWT
3. Lookup Licence by email in Strapi
4. Verify `HMAC(token) === licence.magic_token` AND `magic_token_expires_at > now` → 400 if mismatch
5. PATCH Licence: clear `magic_token` and `magic_token_expires_at`
6. Sign and set `ck_access` cookie
7. Redirect to `/tools/cv-rewriter` (or `/?recovered=1`)

**Response 302**: Redirect with `ck_access` cookie set  
**Response 400**: `{ error: 'Invalid or expired link' }` (then redirect to `/recover?error=1`)
