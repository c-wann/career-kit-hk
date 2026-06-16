# Tasks: Strapi + Stripe E-commerce Shop

**Input**: Design documents from `specs/001-strapi-stripe-ecommerce/`  
**Branch**: `001-strapi-stripe-ecommerce` | **Date**: 2026-06-17  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/api-routes.md ✅ quickstart.md ✅

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[US1–US5]**: User Story label from spec.md
- All paths relative to repo root

---

## Phase 1: Setup

**Purpose**: Install new dependencies and create shared scaffolding files.

- [ ] T001 Install new npm packages: `npm install openai resend jose zod`
- [ ] T002 [P] Create `src/types/strapi.ts` — `StrapiProduct` and `StrapiLicence` interfaces per data-model.md
- [ ] T003 [P] Create `src/types/tool-inputs.ts` — all tool I/O interfaces (`CVRewriterInput/Output`, `SOPBuilderInput/Output`, `WeeklyPlannerInput/Output`, `Language`, `DayPlan`, etc.) per data-model.md
- [ ] T004 [P] Create `src/lib/cookieAuth.ts` — `signPayload()` and `verifyPayload()` using Node.js `crypto` HMAC-SHA256; `readSessionCookie()` and `readAccessCookie()` helpers; cookie name constants (`ck_session`, `ck_access`)
- [ ] T005 [P] Create `src/lib/inputSanitizer.ts` — `sanitizeInput()` with max-length check, control-char strip, and prompt-injection regex guard; per-tool length config object
- [ ] T006 [P] Create `src/lib/strapiClient.ts` — typed `strapiGet()`, `strapiPost()`, `strapiPatch()` helpers using `fetch` with Bearer token; `getProducts()` must handle Strapi 5 flat response shape (no `.attributes` wrapper) and include a try/catch fallback returning an empty array on fetch failure; `getLicenceByCustomerId()`, `getLicenceByEmail()`, `createLicence()`, `updateLicence()` functions
- [ ] T007 [P] Create `src/lib/magicLink.ts` — `generateMagicToken(email)` using `jose` HS256 (exp 15m), `verifyMagicToken(token)` using `jose`, `hashToken(token)` using Node.js crypto SHA256

**Checkpoint**: All shared lib modules and type files exist. Phase 2 can begin.

---

## Phase 2: Foundational — Auth Middleware + Strapi Migration

**Purpose**: Blocks all user story work. Migrate `licenseStore.ts` to Strapi. Establish cookie-based access enforcement used by all tool routes.

**⚠️ CRITICAL**: No user story tool work can begin until T008–T012 are complete.

- [ ] T008 Update `src/app/api/stripe-webhook/route.ts` — replace `ensureLicenseForCustomer` / `recordCheckoutSession` calls with `createLicence` / `updateLicence` from `strapiClient.ts`; extract `email` from `session.customer_details.email`; maintain idempotent upsert logic (SC-004)
- [ ] T009 Create `src/app/api/checkout/verify/route.ts` — `GET` handler: call `stripe.checkout.sessions.retrieve(session_id)`, verify `payment_status === 'paid'`, extract `customer_email` + `metadata.plan`, sign and set `ck_access` cookie via `cookieAuth.ts`, return `{ ok: true, plan }`
- [ ] T010 Create `src/app/deliver/page.tsx` — Server Component: read `session_id` query param, call `/api/checkout/verify`, display "Access granted" with links to tool pages; show generic error if verification fails
- [ ] T011 Verify `src/lib/licenseStore.ts` is no longer imported anywhere; delete `src/lib/licenseStore.ts` and `data/license-db.json` (if exists)
- [ ] T012 Add `COOKIE_SECRET`, `MAGIC_LINK_SECRET`, `RESEND_API_KEY`, `STRAPI_URL`, `STRAPI_API_TOKEN`, `STRAPI_ADMIN_API_TOKEN` to `.env.local.example` (create file if absent); update `PRODUCT_SPEC.md` env var table

**Checkpoint**: Stripe webhook writes to Strapi. Cookie verify route issues `ck_access`. Foundation ready.

---

## Phase 3: User Story 1 — Purchase a Plan and Gain Tool Access (Priority: P1) 🎯 MVP

**Goal**: Visitor clicks "Buy Now" → Stripe Checkout → redirected back → `ck_access` cookie issued → tool pages accessible.

**Independent Test**: Load landing page, click "Buy Now" (onetime), complete Stripe test checkout, verify redirect to `/deliver`, confirm `ck_access` cookie is set in browser dev tools, navigate to `/tools/cv-rewriter`, confirm tool UI renders without upgrade prompt.

- [ ] T013 [US1] Update `src/app/page.tsx` — fetch 4 `Product` records from Strapi with `revalidate: 60` via `strapiClient.getProducts()`; map slug → Stripe Price ID env var; render pricing grid with "Buy Now" CTAs linking to `/api/checkout/[plan]` (FR-009, FR-011)
- [ ] T014 [US1] Create `src/app/recover/page.tsx` — form with email input field; `POST /api/recover-access`; show "check your inbox" message on success; show validation error on invalid email (FR-013)
- [ ] T015 [P] [US1] Add `ck_session` cookie initialisation to root layout or middleware: if `ck_session` absent on first visit, set `{ cv: 0, sop: 0, planner: 0 }` signed cookie (FR-004)

**Checkpoint**: Full purchase flow works end-to-end. SC-001 (≤3 min checkout) achievable.

---

## Phase 4: User Story 2 — CV Achievement Rewriter (Priority: P2)

**Goal**: User submits CV bullet, role, industry, language → receives 3 rewritten achievement statements. Free-tier limit enforced.

**Independent Test**: Navigate to `/tools/cv-rewriter`, submit a bullet point in EN. Confirm 3 rewrites appear. Clear cookies and resubmit — confirm free-tier used up; submit again and confirm upgrade prompt appears.

- [ ] T016 [US2] Create `src/app/api/tools/cv-rewriter/route.ts` — `POST` handler: Zod input validation → `sanitizeInput()` → read `ck_access` or `ck_session.cv` → call OpenAI `gpt-4o-mini` with system prompt and a 15s `AbortSignal.timeout(15000)` (SC-002) → parse 3 rewrites → increment `ck_session.cv` if free-tier → return `{ rewrites: [string, string, string] }`; return 402 if free-tier exhausted (FR-015, FR-016, FR-005)
- [ ] T017 [US2] Create OpenAI system prompt constant for CV Rewriter in `src/lib/prompts/cv-rewriter.ts` — enforce "Action verb + What you did + Result/Impact" format; include Cantonese register instruction for ZH (FR-007)
- [ ] T018 [US2] Create `src/app/tools/cv-rewriter/page.tsx` — form with `rawText` textarea, `role` input, `industry` select, `language` toggle; `POST /api/tools/cv-rewriter`; render 3 rewrite cards; show upgrade CTA on 402; show user-friendly error on 500 (no raw API errors per FR spec)
- [ ] T019 [P] [US2] Add EN/ZH i18n strings for CV Rewriter UI labels to `messages/en.json` and `messages/zh.json`

**Checkpoint**: CV Rewriter tool works end-to-end. Free-tier block verified (SC-007).

---

## Phase 5: User Story 3 — Client SOP Builder (Priority: P2)

**Goal**: Freelancer submits service type, pain point, optional business name, language → receives full 4-section onboarding SOP.

**Independent Test**: Navigate to `/tools/sop-builder`, submit form with `serviceType=design`, `painPoint=late_payments`, `language=en`. Confirm all 4 sections render (enquiry reply, quotation structure, follow-up sequence with 4 day entries, checklist with ≥5 items).

- [ ] T020 [US3] Create `src/app/api/tools/sop-builder/route.ts` — `POST` handler: Zod validation → `sanitizeInput()` → access check → OpenAI call with 15s `AbortSignal.timeout(15000)` (SC-002) → parse structured JSON output into `SOPBuilderOutput` → return; 402 if free-tier exhausted; 500 on OpenAI failure (FR-015, FR-016)
- [ ] T021 [US3] Create OpenAI system prompt for SOP Builder in `src/lib/prompts/sop-builder.ts` — instruct model to return JSON matching `SOPBuilderOutput`; include 4-day follow-up (Day 0/1/3/7) with channel assignments; Cantonese register for ZH (FR-007)
- [ ] T022 [US3] Create `src/app/tools/sop-builder/page.tsx` — form with `serviceType` select, `businessName` text, `painPoint` select, `language` toggle; render 4 output sections; upgrade CTA on 402; user-friendly error on 500
- [ ] T023 [P] [US3] Add EN/ZH i18n strings for SOP Builder UI labels to `messages/en.json` and `messages/zh.json`

**Checkpoint**: SOP Builder works end-to-end. All 4 output sections verified.

---

## Phase 6: User Story 4 — Weekly Planner (Priority: P3)

**Goal**: User submits weekly goal, user type, available hours, language → receives Mon–Sun schedule with 3 tasks/day and reflection prompts.

**Independent Test**: Navigate to `/tools/weekly-planner`, submit `goal="Apply to 5 jobs"`, `userType=job_seeker`, `hoursAvailable=20`, `language=zh`. Confirm 7 day cards appear each with 3 tasks in Traditional Chinese (Cantonese register), and 3 reflection prompts appear below (FR-007, SC-003).

- [ ] T024 [US4] Create `src/app/api/tools/weekly-planner/route.ts` — `POST` handler: Zod validation → `sanitizeInput()` → access check → OpenAI call with 15s `AbortSignal.timeout(15000)` (SC-002) → parse 7-day schedule + reflection prompts → return; 402/500 as per contract (FR-015, FR-016)
- [ ] T025 [US4] Create OpenAI system prompt for Weekly Planner in `src/lib/prompts/weekly-planner.ts` — instruct model to return JSON matching `WeeklyPlannerOutput`; tailor tasks to `userType`; Cantonese ZH register (FR-007)
- [ ] T026 [US4] Create `src/app/tools/weekly-planner/page.tsx` — form with `goal` text, `userType` select, `hoursAvailable` number, `language` toggle; render 7 day cards (Mon–Sun) each with 3 tasks; render reflection prompts; upgrade CTA + error handling
- [ ] T027 [P] [US4] Add EN/ZH i18n strings for Weekly Planner UI labels to `messages/en.json` and `messages/zh.json`

**Checkpoint**: Weekly Planner works end-to-end. ZH Cantonese register confirmed (SC-003).

---

## Phase 7: User Story 5 — Strapi-Driven Pricing & Content (Priority: P3)

**Goal**: Non-technical editor updates `Product` in Strapi Admin → changes appear on landing page within 60s (ISR).

**Independent Test**: Update a `Product.description_en` field in Strapi Admin, wait ≤60s, reload landing page, confirm new description appears without redeploy.

- [ ] T028 [US5] Confirm `src/app/page.tsx` (updated in T013) uses `{ next: { revalidate: 60 } }` on Strapi fetch; add graceful fallback to static copy if Strapi is unreachable (US5 Scenario 2, FR-009)
- [ ] T029 [P] [US5] Verify `src/lib/strapiClient.ts` `getProducts()` correctly handles Strapi 5 flat response shape and fallback (requirements merged into T006). If T006 is complete and covers these, mark this done immediately.

**Checkpoint**: ISR ≤60s confirmed. Strapi downtime falls back gracefully.

---

## Phase 8: User Story 1 (continued) — Access Recovery via Magic Link

**Goal**: Paying user who lost their cookie submits email → receives magic link → clicks link → `ck_access` re-issued.

**Independent Test**: With a Strapi Licence record for `test@example.com`, POST `{ email: "test@example.com" }` to `/api/recover-access`. Confirm Resend sends an email (or check Resend dashboard). Click link. Confirm `ck_access` cookie is set and redirect occurs.

- [ ] T030 [US1] Create `src/app/api/recover-access/route.ts` — `POST` handler: Zod email validation → `strapiClient.getLicenceByEmail()` → if not found, return 200 generic message (no enumeration) → `magicLink.generateMagicToken(email)` → hash token → `strapiClient.updateLicence()` to store hash + expiry → `Resend.emails.send()` with magic link URL → return 200 (FR-013, FR-014)
- [ ] T031 [US1] Create `src/app/api/recover-access/verify/route.ts` — `GET` handler: `magicLink.verifyMagicToken(token)` → extract email → `getLicenceByEmail()` → verify `HMAC(token) === licence.magic_token` AND not expired → `updateLicence()` to clear token fields → sign + set `ck_access` cookie → redirect to `/tools/cv-rewriter` (FR-013, FR-014)

**Checkpoint**: Full access recovery flow verified end-to-end (FR-013, FR-014).

---

## Phase 9: Polish & Cross-Cutting

**Purpose**: Security, environment validation, and launch readiness.

- [ ] T032 [P] Add Zod coercion + `export const runtime = 'nodejs'` to all 3 tool routes and 2 recovery routes (verify no Edge runtime conflicts)
- [ ] T033 [P] Audit all API routes: confirm `STRAPI_ADMIN_API_TOKEN` and `OPENAI_API_KEY` are referenced only in server-side route files; run `npm run build` and grep `.next/static/` for secret keys to confirm SC-006
- [ ] T034 [P] Add `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options` headers via `next.config.ts` `headers()` export
- [ ] T035 [P] Update `README.md` with local dev setup steps (Stripe CLI webhook forwarding, `.env.local` required vars)
- [ ] T036 Run `npm run lint` and fix all TypeScript/ESLint errors

---

## Dependencies

```
T001 → T002, T003, T004, T005, T006, T007  (setup unlocks all lib creation)
T002, T006 → T008                           (Strapi types + client needed for webhook)
T004 → T008, T009, T015, T016, T020, T024, T030, T031  (cookie auth used everywhere)
T005 → T016, T020, T024                    (sanitizer needed by tool routes)
T006 → T008, T009, T030, T031              (Strapi client needed by multiple routes)
T007 → T030, T031                          (magic link helpers)
T008, T009, T010, T011, T012 → T013        (Phase 2 must complete before landing page ISR fetch)
T013 → T028                                (ISR refinement builds on initial fetch)
T015 → T016, T020, T024                    (session cookie must exist before tool access checks)
T016, T017 → T018                          (API route + prompt before UI)
T020, T021 → T022                          (API route + prompt before UI)
T024, T025 → T026                          (API route + prompt before UI)
T030 → T031                                (send before verify)
```

## Parallel Execution Examples

**Phase 2 parallel group** (after T001):
- T002, T003, T004, T005, T006, T007 — all different files, no inter-dependencies

**Phase 3–6 parallel group** (after Phase 2 complete):
- T016 + T020 + T024 — different tool route files; all use shared libs from Phase 1
- T019 + T023 + T027 — i18n strings for different tools

**Phase 9 parallel group** (after all features):
- T032, T033, T034, T035 — independent cleanup tasks

## Implementation Strategy

**MVP scope**: Phase 1 + Phase 2 + Phase 3 (US1 — Purchase Flow) = T001–T015  
This gives a fully deployable product with working payment, Strapi content, cookie access enforcement, and landing page — without any AI tools yet.

**Increment 2**: Phase 4 (T016–T019) — CV Rewriter (flagship tool, highest conversion driver)  
**Increment 3**: Phase 5 + 6 (T020–T027) — SOP Builder + Weekly Planner  
**Increment 4**: Phase 7 + 8 (T028–T031) — Strapi ISR + Access Recovery  
**Final**: Phase 9 (T032–T036) — Security hardening + launch readiness

**Total tasks**: 36  
**Parallelisable**: 16 tasks marked `[P]`
