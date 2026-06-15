# 📋 Product Specification — Career Kit HK

## Overview
A bilingual (EN/繁中) web-based toolkit sold via Lemon Squeezy, deployed on Vercel.

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

```
User → Next.js (Vercel)
         ↓
   [Tool Page] → API Route → OpenAI / Template Engine
         ↓
   Lemon Squeezy (Checkout)
         ↓
   Webhook → Unlock access (DB: Vercel KV / Supabase)
```
