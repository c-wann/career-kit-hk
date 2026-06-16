# Research: Strapi + Stripe E-commerce Shop

**Phase 0 output for `speckit.plan`**  
**Date**: 2026-06-17 | **Branch**: `001-strapi-stripe-ecommerce`

---

## 1. Strapi 5 REST API Integration from Next.js 16

**Decision**: Use Strapi REST API (not GraphQL) with Bearer token authentication.

**Rationale**:
- REST is simpler to type without a code-gen step
- Strapi 5 REST endpoints follow `/api/[plural-content-type]?populate=*` convention
- Two tokens required: read-only `STRAPI_API_TOKEN` for ISR/SSG fetches; write-only `STRAPI_ADMIN_API_TOKEN` (service account token) for webhook handler writes
- ISR page-level fetch: `fetch(strapiUrl + '/api/products?populate=*', { headers: { Authorization: 'Bearer ...' }, next: { revalidate: 60 } })`

**Strapi 5 breaking changes vs Strapi 4**:
- REST response shape changed: `data.attributes` is gone; fields are now flat on `data` directly
- Populate strategy: `?populate=*` for shallow, `?populate[relation][populate]=*` for nested
- Authentication token types: "API Token" (scoped read/write) vs "Transfer Token" — use API Tokens

**Alternatives considered**:
- GraphQL with Strapi plugin: rejected — adds `@apollo/client` or `graphql-request` dep, code-gen needed, more configuration for ISR
- Strapi JS SDK: rejected — still in beta for v5; REST is stable

---

## 2. HTTP-Only Cookie Access Control in Next.js App Router

**Decision**: Use `cookies()` from `next/headers` in Server Components/Actions and `ResponseCookies` via `NextResponse` in API Route Handlers. Sign cookies with HMAC-SHA256 using `crypto` (built-in Node.js — no extra dep).

**Free-tier cookie (anonymous)**:
- Name: `ck_session`
- Value: JSON `{ cv: 0, sop: 0, planner: 0 }` — usage counts per tool (0 or 1)
- HMAC signed to prevent tampering
- `httpOnly: true`, `secure: true` (prod), `sameSite: 'lax'`, `maxAge: 30 days`, `path: '/'`

**Paid-user cookie (access token)**:
- Name: `ck_access`
- Value: HMAC-signed payload `{ email, plan, iat }`
- `httpOnly: true`, `secure: true`, `sameSite: 'lax'`, `maxAge: 365 days`, `path: '/'`
- Set by `POST /api/stripe-webhook` after successful checkout (via `Set-Cookie` response header on subsequent verification)
  - Note: Stripe webhook does not yield a browser response. Cookie is issued instead by `GET /api/checkout/verify?session_id=...` (the Stripe success redirect URL, already at `/deliver?session_id=...`)

**Updated flow**:
1. Stripe Checkout succeeds → redirects browser to `/deliver?session_id=...`
2. `/deliver` page calls `/api/checkout/verify?session_id=...` (Server Action or API route)
3. Verify route calls `stripe.checkout.sessions.retrieve(sessionId)` to confirm paid status
4. Issues `ck_access` cookie with signed payload
5. Webhook (`/api/stripe-webhook`) still creates/updates Strapi Licence record — now via Strapi API instead of `licenseStore.ts`

**Cookie signing utility** (`src/lib/cookieAuth.ts`):
- `signPayload(data)` → base64url(JSON) + `.` + HMAC-SHA256(base64url(JSON), COOKIE_SECRET)
- `verifyPayload(token)` → parse + verify, return data or null
- Env var: `COOKIE_SECRET` (≥32 random bytes, hex)

**Alternatives considered**:
- `iron-session`: rejected — adds dependency; built-in `crypto` is sufficient
- JWT (jose): evaluated for magic links (see §4); not used for session cookies

---

## 3. Email Provider

**Decision**: Use **Resend** (`resend` npm package).

**Rationale**:
- First-class Next.js integration; `Resend.emails.send()` is a simple async call
- Generous free tier (100 emails/day)
- React Email templates supported but not required for MVP
- Env var: `RESEND_API_KEY` (maps to `EMAIL_API_KEY` from spec Assumptions)

**Alternatives considered**:
- SendGrid (`@sendgrid/mail`): larger SDK, more enterprise-oriented; fine but heavier
- Nodemailer + SMTP: requires configuring an SMTP relay; more ops overhead

---

## 4. Magic Link Token Generation

**Decision**: Use `jose` npm package for HS256 JWT signing/verification.

**Rationale**:
- `jose` works in both Edge and Node.js runtimes
- Built-in expiry enforcement (`exp` claim)
- Simple API: `new SignJWT({ email }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('15m').sign(key)`
- Env var: `MAGIC_LINK_SECRET` (32+ byte hex string)

**Token persistence (single-use enforcement)**:
- Store `magicToken` and `magicTokenExpiresAt` fields on the Strapi `Licence` record
- On verify: check token matches DB record AND JWT signature AND `exp` not past
- After successful verify: PATCH Licence to clear `magicToken` and `magicTokenExpiresAt`
- This prevents replay attacks even if JWT signature alone would still be valid

**Alternatives considered**:
- In-memory token blacklist: rejected — unreliable on Vercel serverless (multiple instances)
- Separate "magic token" Strapi content type: rejected — overkill; fields on Licence are sufficient

---

## 5. OpenAI API Usage Pattern

**Decision**: Use `openai` npm package with **non-streaming** `chat.completions.create()` calls in API route handlers.

**Rationale**:
- All three tools have a ≤15s requirement (SC-002/FR-012) — non-streaming completes well within this
- Streaming adds complexity (ReadableStream, incremental state updates in client)
- MVP: complete JSON response is simpler to validate, log, and handle errors on
- Server-side only: `OPENAI_API_KEY` stays in server environment (never in client bundle) per FR-005/SC-006

**Pattern** per tool route:
```typescript
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
  temperature: 0.7,
  max_tokens: 1500,
  timeout: 14000, // stay under 15s FR-012
});
```

**Alternatives considered**:
- Streaming with `stream: true` + Server-Sent Events: deferred to post-MVP
- Edge runtime: rejected — `openai` package works in Node.js runtime; tool routes use `export const runtime = 'nodejs'`

---

## 6. Input Sanitisation Strategy

**Decision**: Implement a shared `sanitizeInput()` utility in `src/lib/inputSanitizer.ts`.

**Checks applied** (in order):
1. **Length enforcement**: reject if any field exceeds declared max length (per-tool config)
2. **Prompt injection pattern matching**: case-insensitive regex scan for known injection phrases:
   - `ignore (previous|all|prior|above)?\s*(instructions?|prompt|rules?|context)`
   - `you are now|act as|pretend (you are|to be|that you)`
   - `system prompt|DAN|jailbreak`
3. **Null/empty check**: reject empty required fields
4. **Strip control characters**: remove `\x00`–`\x1F` (except `\n`, `\t`)

**Response on rejection**: HTTP 422 with `{ error: 'Input rejected', reason: 'Content policy violation' | 'Input too long' | 'Required field missing' }`

**Alternatives considered**:
- Full OpenAI Moderation API call (Q4 answer was Option A): deferred — adds latency and cost
- Zod schema validation: use for structural validation (field types/lengths); injection check is layered on top

---

## 7. Strapi Content Type Design for Access Recovery

**Decision**: Add `magic_token` and `magic_token_expires_at` fields to the Strapi `Licence` content type. Also add `email` field (Stripe webhook captures customer email).

**Required Strapi Licence fields** (full):
| Field | Type | Notes |
|---|---|---|
| `stripe_customer_id` | String (unique) | Stripe cus_xxx |
| `email` | Email | Customer email from Stripe checkout |
| `plan` | Enumeration | onetime \| monthly \| annual |
| `purchased_at` | DateTime | |
| `expires_at` | DateTime (nullable) | null = lifetime |
| `magic_token` | String (nullable) | hashed JWT for magic link |
| `magic_token_expires_at` | DateTime (nullable) | cleared after use |

**Note**: Strapi content types must be created via the Admin Panel before deploying — see `quickstart.md`.

---

## 8. Dependencies to Add

The following npm packages are not yet in `package.json` and must be added:

| Package | Purpose |
|---|---|
| `openai` | OpenAI chat completions |
| `resend` | Transactional email (magic links) |
| `jose` | Magic link JWT signing/verification |
| `zod` | Input schema validation for tool routes |

No additional packages needed for cookie auth (uses Node.js built-in `crypto`).
