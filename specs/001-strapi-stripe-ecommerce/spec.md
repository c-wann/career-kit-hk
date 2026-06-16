# Feature Specification: Strapi + Stripe E-commerce Shop

**Feature Branch**: `001-strapi-stripe-ecommerce`  
**Created**: 2026-06-17  
**Status**: Draft  
**Input**: Career Kit HK — bilingual career & freelance toolkit for Hong Kong professionals, sold via Stripe, content managed via Strapi headless CMS, deployed on Vercel.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Purchase a Plan and Gain Tool Access (Priority: P1)

A Hong Kong professional visits the landing page, selects a pricing plan, completes payment via Stripe, and immediately gains access to all three tools.

**Why this priority**: This is the primary revenue and conversion flow. Without it the product cannot generate income or deliver value to paying users.

**Independent Test**: Can be fully tested by loading the landing page, clicking "Buy Now" on the One-time plan, completing a Stripe test checkout, and verifying the user is redirected to a working tool page with full access — without any other feature being built.

**Acceptance Scenarios**:

1. **Given** a visitor on the landing page, **When** they click a paid pricing CTA, **Then** they are redirected to a Stripe Checkout Session for the correct plan.
2. **Given** a Stripe Checkout Session completes successfully, **When** the webhook fires, **Then** a Licence record is created/updated in Strapi for the buyer's email.
3. **Given** a user with a valid licence, **When** they navigate to any tool page, **Then** they see the full tool interface with no usage limits.
4. **Given** an invalid or expired licence, **When** a user tries to access a paid tool beyond the free limit, **Then** they are shown an upgrade prompt.
5. **Given** a Stripe webhook with an invalid signature, **When** the webhook endpoint receives it, **Then** the request is rejected with HTTP 400 and no licence is created.

---

### User Story 2 — Use the CV Achievement Rewriter Tool (Priority: P2)

A job seeker enters a weak CV bullet point, selects their role and industry, chooses a language (EN or ZH), and receives 3 rewritten achievement statements they can copy into their CV.

**Why this priority**: This is the flagship tool most likely to drive conversion. Users who see output quality will pay.

**Independent Test**: Can be tested end-to-end by submitting a CV bullet via the tool form and verifying 3 distinct rewrites appear within 10 seconds — with free-tier users limited to 1 use and paid users having unlimited access.

**Acceptance Scenarios**:

1. **Given** a user on the CV tool page, **When** they submit a raw bullet, role, and industry, **Then** 3 rewritten achievement statements appear in the selected language (EN or ZH).
2. **Given** a free-tier user who has used the tool once, **When** they try to submit again, **Then** they see an upgrade prompt instead of output.
3. **Given** a ZH language selection, **When** rewrites are generated, **Then** output is in Traditional Chinese (Cantonese register: "係", "喺", "嘅").
4. **Given** any tool submission, **When** the OpenAI API call fails, **Then** a user-friendly error message is shown and no error is logged to the client.

---

### User Story 3 — Use the Client SOP Builder Tool (Priority: P2)

A freelancer selects their service type, optionally provides a business name, chooses a pain point (e.g. late payments), and receives a complete client onboarding SOP including WhatsApp reply templates, a 3-tier quotation structure, and a 4-entry follow-up sequence (Day 0, Day 1, Day 3, Day 7).

**Why this priority**: High value for freelancers who are the second primary persona. Converts well because the output is immediately usable.

**Independent Test**: Can be tested by submitting the SOP form and verifying all four output sections (enquiry reply, quotation structure, follow-up sequence, onboarding checklist) appear in the selected language.

**Acceptance Scenarios**:

1. **Given** a freelancer who fills in the SOP form, **When** they submit, **Then** all four output sections are returned in the selected language.
2. **Given** a Day 0/1/3/7 follow-up sequence, **When** rendered, **Then** each entry shows the day number, channel (WhatsApp/email/IG), and message text.
3. **Given** an empty `business_name` field, **When** the SOP is generated, **Then** output uses a generic placeholder instead of a business name.

---

### User Story 4 — Use the Weekly Planner Tool (Priority: P3)

A job seeker or freelancer enters their weekly goal, selects their user type, and provides their available hours. They receive a Mon–Sun schedule with 3 priority tasks per day and end-of-week reflection prompts.

**Why this priority**: Useful but less unique. Builds retention after initial purchase rather than driving conversion.

**Independent Test**: Can be tested by submitting the planner form and verifying a Mon–Sun schedule with 3 tasks per day appears in the selected language.

**Acceptance Scenarios**:

1. **Given** a user who submits a goal and available hours, **When** the planner generates, **Then** a Mon–Sun schedule appears with 3 priority tasks per day.
2. **Given** `user_type = Job Seeker`, **When** the schedule is generated, **Then** tasks focus on job search activities (applications, networking, interview prep).
3. **Given** `user_type = Freelancer`, **When** the schedule is generated, **Then** tasks focus on client acquisition, project delivery, and admin.
4. **Given** a ZH language selection, **When** the planner is rendered, **Then** all output is in Traditional Chinese (Cantonese register).

---

### User Story 5 — Pricing and Product Content Managed via Strapi (Priority: P3)

A non-technical editor updates pricing copy, product descriptions, or i18n strings in the Strapi Admin Panel, and changes are reflected on the live landing page without a code redeploy.

**Why this priority**: Operational efficiency — enables business iteration without developer intervention. Required for long-term scalability but not blocking MVP launch.

**Independent Test**: Can be tested by updating a product description field in Strapi and verifying the Next.js landing page reflects the change after an ISR revalidation (within the configured TTL).

**Acceptance Scenarios**:

1. **Given** an editor updates a `Product` description in Strapi, **When** the Next.js page revalidates, **Then** the new description appears on the landing page.
2. **Given** Strapi is unavailable at build time, **When** Next.js falls back to static content, **Then** the last cached content is served rather than a broken page.

---

### Edge Cases

- What happens when a Stripe webhook is delivered twice for the same `checkout.session.completed` event? → Licence creation must be idempotent (upsert by `stripeCustomerId`).
- What happens if `STRIPE_PRICE_ID_*` env vars are missing? → API route returns HTTP 500 with a clear error; no checkout session is created.
- What happens if the OpenAI response is empty or malformed? → Return a user-friendly error; do not surface raw API errors.
- What happens if the user switches language mid-session? → All visible UI copy switches immediately; tool outputs are in the language selected at submission time.
- What happens if a user buys the annual plan but already has the monthly plan? → Webhook upserts the licence with the higher-tier plan.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST redirect users to a Stripe Checkout Session when they click a paid plan CTA.
- **FR-002**: System MUST verify Stripe webhook signatures before processing any `checkout.session.completed` event.
- **FR-003**: System MUST create or update a `Licence` record in Strapi upon successful payment, keyed by `stripeCustomerId`.
- **FR-004**: System MUST enforce the free-tier limit (1 use per tool) using an anonymous session cookie; paid users are identified by a signed HTTP-only access-token cookie set by `/api/checkout/verify` after Stripe session confirmation (the webhook writes the Licence to Strapi; the cookie is issued client-side on redirect, not inside the webhook).
- **FR-005**: System MUST call the OpenAI API from a server-side API route — never from the client — to protect the API key.
- **FR-006**: All three tools (CV Rewriter, SOP Builder, Weekly Planner) MUST accept a `language` toggle (EN / ZH) and return output in the selected language.
- **FR-007**: ZH output MUST use Traditional Chinese in Cantonese register (not Mandarin/Simplified).
- **FR-008**: Pricing copy, product descriptions, and i18n strings MUST be fetchable from Strapi at build/request time.
- **FR-009**: The Next.js frontend MUST use ISR to serve Strapi content with `revalidate = 60` (seconds) on all pages consuming Strapi data. No on-demand revalidation webhook is required for MVP.
- **FR-010**: The `STRAPI_ADMIN_API_TOKEN` (write-access) MUST only be used server-side in the webhook handler; never exposed to the client.
- **FR-011**: The landing page MUST display all four pricing tiers with CTAs linking to the correct Stripe Price IDs.
- **FR-012**: Tool output MUST be streamed or returned as a complete response within 15 seconds under normal conditions.
- **FR-013**: System MUST provide an access-recovery flow: a user submits their purchase email, the system verifies a matching `Licence` record in Strapi, and sends a one-time magic link via transactional email to re-issue the HTTP-only access cookie.
- **FR-014**: Magic-link tokens MUST be single-use and expire within 15 minutes of issuance.
- **FR-015**: Each AI tool MUST be served by its own dedicated server-side API route (`/api/tools/cv-rewriter`, `/api/tools/sop-builder`, `/api/tools/weekly-planner`), each with independent input validation and rate-limiting.
- **FR-016**: Each tool API route MUST sanitise user input server-side before calling the OpenAI API — rejecting or stripping inputs that contain prompt-injection patterns (e.g. "ignore previous instructions") and enforcing maximum character length limits per field.

### Key Entities

- **Product**: Represents a pricing tier. Attributes: `name`, `slug`, `description` (EN/ZH), `features[]`, `price` (display), `stripePriceId`.
- **Licence**: Represents a user's access grant. Attributes: `stripeCustomerId`, `plan` (onetime | monthly | annual), `purchasedAt`, `expiresAt` (null = lifetime).
- **CVAchievement** (ephemeral): Input/output for Tool A. Not persisted. See `CVAchievement` interface in [PRODUCT_SPEC.md](../../PRODUCT_SPEC.md).
- **ClientSOP** (ephemeral): Input/output for Tool B. Not persisted. See `ClientSOP` interface in [PRODUCT_SPEC.md](../../PRODUCT_SPEC.md).
- **WeeklyPlan** (ephemeral): Input/output for Tool C. Not persisted.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from landing page to completed Stripe checkout and back to the app in under 3 minutes.
- **SC-002**: All three tool forms return output within 15 seconds of submission under normal load.
- **SC-003**: ZH output passes a manual spot-check confirming Cantonese register (not Mandarin) for 100% of generated content.
- **SC-004**: Stripe webhook endpoint correctly handles 100% of `checkout.session.completed` events idempotently (duplicate deliveries do not create duplicate licences).
- **SC-005**: Pricing content updated in Strapi is reflected on the live landing page within the configured ISR TTL (target: ≤ 60 seconds).
- **SC-006**: No Stripe secret key, OpenAI key, or Strapi write token is ever included in client-side JavaScript bundles.
- **SC-007**: Free-tier users are blocked from a second tool use with a clear upgrade prompt — confirmed by manual test.

---

## Clarifications

### Session 2026-06-17

- Q: How should free-tier usage limits and paid-user licence access be enforced without a login system? → A: HTTP-only cookie — an anonymous session cookie tracks free-tier usage (1 use per tool); a signed access token set as an HTTP-only cookie post-checkout verifies paid-user licence.
- Q: How should a paying user recover access if their cookie is lost (device switch, browser clear, incognito)? → A: Email magic link — user enters their purchase email on a recovery page; system sends a one-time login link via transactional email (Resend/SendGrid); clicking the link re-issues the HTTP-only access cookie.
- Q: Should the three tools share a single API route or each have a dedicated route? → A: Dedicated routes — one per tool (`/api/tools/cv-rewriter`, `/api/tools/sop-builder`, `/api/tools/weekly-planner`) for independent validation, rate-limiting, and prompt management.
- Q: How should user-submitted free-form text be sanitised before being sent to the OpenAI API? → A: Server-side input sanitisation — strip or reject inputs containing prompt-injection patterns and enforce maximum length limits server-side before forwarding to OpenAI; rely on OpenAI's built-in content filters for harmful content.
- Q: Should Strapi actively notify Next.js when content changes (on-demand revalidation), or is time-based ISR sufficient? → A: Time-based ISR only — set `revalidate = 60` on the relevant pages/layouts; no Strapi webhook or `/api/revalidate` route is required for MVP.

---

## Assumptions

- Strapi 5 instance is deployed on Strapi Cloud and accessible via `STRAPI_URL` env var before the Next.js app is deployed.
- Stripe account is configured with HKD as the default currency and the three Price IDs (one-time, monthly, annual) are created before launch.
- OpenAI API key with sufficient quota is available; GPT-4o or GPT-4o-mini is used for all three tools.
- The existing `src/app/api/checkout/[plan]/route.ts` and `src/app/api/stripe-webhook/route.ts` files are the starting point for the payment flow; `licenseStore.ts` will be replaced by Strapi API calls.
- `next-intl` v4 locale routing (`src/app/[locale]/`) is out of scope for this feature — the current single-locale scaffold is acceptable for MVP.
- Mobile responsiveness is in scope; native iOS/Android apps are out of scope.
- User authentication (login/session) is out of scope for MVP — licence verification is done by checking Stripe `customerId` or email against Strapi.
- The `Procfile` (Azure App Service) is maintained but Vercel is the primary deployment target.
- A transactional email provider (Resend) is provisioned before launch; the API key is stored in `RESEND_API_KEY` env var and used only server-side.
