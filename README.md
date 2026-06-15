# 🚀 Career Kit HK

**Career & Freelance Efficiency Toolkit for Hong Kong**

An all-in-one web app helping job seekers and freelancers in HK to land more opportunities — CV builder, SOP generator, client onboarding tools, and weekly planner.

## 🎯 Target Users
- **Job Seekers (A)**: CV rewriting, cover letters, interview prep
- **Freelancers / Small Business (B)**: Client SOP, quotation templates, onboarding checklist

## 🛠 Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Payments**: Lemon Squeezy
- **Deployment**: Vercel
- **i18n**: next-intl (EN / 繁體中文)

## 📦 Products
| Plan | Price | Features |
|------|-------|---------|
| One-time | HKD 399 | Full toolkit access |
| Pro Monthly | HKD 149/mo | All tools + updates |

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
career-kit-hk/
├── app/                    # Next.js App Router
│   ├── [locale]/          # i18n routes
│   │   ├── page.tsx       # Landing page
│   │   ├── tool/          # Tool pages
│   │   └── pricing/       # Pricing page
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utilities & helpers
├── messages/              # i18n translation files
│   ├── en.json
│   └── zh.json
└── public/                # Static assets
```

## 📝 Roadmap
- [ ] CV Achievement Rewriter
- [ ] Cover Letter Generator
- [ ] Interview Q&A Framework
- [ ] Client SOP Builder
- [ ] Quotation Template
- [ ] Weekly Planner

---
Built with ❤️ for HK professionals
