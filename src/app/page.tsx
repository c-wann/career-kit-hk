'use client'

import { useState } from 'react'
import Link from 'next/link'

type Lang = 'en' | 'zh'

const copy = {
  en: {
    nav: { tools: 'Tools', pricing: 'Pricing', login: 'Login' },
    hero: {
      badge: '🇭🇰 Made for Hong Kong',
      title: 'Your Career & Freelance Toolkit',
      subtitle: 'Built for Hong Kong professionals — land more jobs, close more clients.',
      cta: 'Try Free',
      ctaSecondary: 'See All Tools',
    },
    tools: {
      heading: 'Three Tools. One Kit.',
      items: [
        {
          id: 'cv',
          icon: '📝',
          name: 'CV Achievement Rewriter',
          description: 'Turn weak bullet points into powerful, measurable achievements that get you interviews.',
          tag: 'Job Seeker',
        },
        {
          id: 'sop',
          icon: '📋',
          name: 'Client SOP Builder',
          description: 'Generate onboarding templates, quotation structures, and follow-up sequences for your freelance business.',
          tag: 'Freelancer',
        },
        {
          id: 'planner',
          icon: '📅',
          name: 'Weekly Planner',
          description: 'Get a structured day-by-day schedule and goal tracker built around your available hours.',
          tag: 'Both',
        },
      ],
      tryNow: 'Try Now →',
    },
    pricing: {
      heading: 'Simple, Transparent Pricing',
      subheading: 'One payment. Lifetime access.',
      tiers: [
        {
          name: 'Free Preview',
          price: 'HKD 0',
          period: '',
          features: ['1 use per tool', 'All 3 tools', 'No credit card needed'],
          cta: 'Start Free',
          highlight: false,
          plan: '',
        },
        {
          name: 'One-time',
          price: 'HKD 399',
          period: 'one-time',
          features: ['Unlimited uses', 'All 3 tools', 'Lifetime access', 'Future tools included'],
          cta: 'Buy Now',
          highlight: true,
          plan: 'onetime',
        },
        {
          name: 'Pro Monthly',
          price: 'HKD 149',
          period: '/mo',
          features: ['Unlimited uses', 'All 3 tools', 'Future updates', 'Priority support'],
          cta: 'Subscribe',
          highlight: false,
          plan: 'monthly',
        },
        {
          name: 'Pro Annual',
          price: 'HKD 1,299',
          period: '/yr',
          features: ['Unlimited uses', 'All 3 tools', 'Future updates', 'Priority support', 'Best value'],
          cta: 'Subscribe',
          highlight: false,
          plan: 'annual',
        },
      ],
    },
    footer: 'Built for Hong Kong. © 2026 Career Kit HK.',
  },
  zh: {
    nav: { tools: '工具', pricing: '定價', login: '登入' },
    hero: {
      badge: '🇭🇰 專為香港而設',
      title: '你嘅求職 & 接案效率工具包',
      subtitle: '專為香港專業人士而設 — 搵工更快，接客更穩。',
      cta: '免費試用',
      ctaSecondary: '睇晒所有工具',
    },
    tools: {
      heading: '三個工具，一個工具包。',
      items: [
        {
          id: 'cv',
          icon: '📝',
          name: 'CV 成就改寫器',
          description: '將普通經歷句轉化為有力嘅成就陳述，令你嘅 CV 更突出，提升面試機會。',
          tag: '求職者',
        },
        {
          id: 'sop',
          icon: '📋',
          name: '客戶 SOP 生成器',
          description: '一鍵生成客戶跟進流程、報價結構同跟進訊息，令你嘅自由接案更專業。',
          tag: '自由工作者',
        },
        {
          id: 'planner',
          icon: '📅',
          name: '週計劃生成器',
          description: '根據你嘅可用時間，制定逐日行動計劃，幫你更有效地搵工或接案。',
          tag: '兩者皆宜',
        },
      ],
      tryNow: '立即試用 →',
    },
    pricing: {
      heading: '清晰透明嘅定價',
      subheading: '一次付款，終身使用。',
      tiers: [
        {
          name: '免費預覽',
          price: 'HKD 0',
          period: '',
          features: ['每個工具用1次', '全部3個工具', '唔需要信用卡'],
          cta: '立即試用',
          highlight: false,
          plan: '',
        },
        {
          name: '一次付款',
          price: 'HKD 399',
          period: '一次性',
          features: ['無限次使用', '全部3個工具', '終身使用', '包括未來工具'],
          cta: '立即購買',
          highlight: true,
          plan: 'onetime',
        },
        {
          name: '月費 Pro',
          price: 'HKD 149',
          period: '/月',
          features: ['無限次使用', '全部3個工具', '未來更新', '優先支援'],
          cta: '立即訂閱',
          highlight: false,
          plan: 'monthly',
        },
        {
          name: '年費 Pro',
          price: 'HKD 1,299',
          period: '/年',
          features: ['無限次使用', '全部3個工具', '未來更新', '優先支援', '最抵用'],
          cta: '立即訂閱',
          highlight: false,
          plan: 'annual',
        },
      ],
    },
    footer: '專為香港而建。© 2026 Career Kit HK.',
  },
}

export default function Home() {
  const [lang, setLang] = useState<Lang>('en')
  const t = copy[lang]

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-indigo-600">Career Kit HK</span>
          <nav className="hidden gap-8 text-sm font-medium text-zinc-600 md:flex">
            <a href="#tools" className="transition hover:text-indigo-600">{t.nav.tools}</a>
            <a href="#pricing" className="transition hover:text-indigo-600">{t.nav.pricing}</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              {lang === 'en' ? '中文' : 'EN'}
            </button>
            <a
              href="#pricing"
              className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              {t.hero.cta}
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-28 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="mb-5 inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            {t.hero.badge}
          </span>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-zinc-900">
            {t.hero.title}
          </h1>
          <p className="mb-10 text-xl leading-relaxed text-zinc-500">{t.hero.subtitle}</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#pricing"
              className="rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              {t.hero.cta}
            </a>
            <a
              href="#tools"
              className="rounded-full border border-zinc-200 px-8 py-3 text-base font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="bg-zinc-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-16 text-center text-3xl font-bold text-zinc-900">{t.tools.heading}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {t.tools.items.map((tool) => (
              <div
                key={tool.id}
                className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-100 transition hover:shadow-md"
              >
                <div className="mb-4 text-4xl">{tool.icon}</div>
                <span className="mb-3 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                  {tool.tag}
                </span>
                <h3 className="mb-3 text-xl font-semibold text-zinc-900">{tool.name}</h3>
                <p className="leading-relaxed text-zinc-500">{tool.description}</p>
                <button className="mt-6 text-sm font-medium text-indigo-600 transition hover:underline">
                  {t.tools.tryNow}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-bold text-zinc-900">{t.pricing.heading}</h2>
            <p className="text-zinc-500">{t.pricing.subheading}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {t.pricing.tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 ring-1 transition ${
                  tier.highlight
                    ? 'scale-105 bg-indigo-600 text-white shadow-xl ring-indigo-600'
                    : 'bg-white text-zinc-900 ring-zinc-100 hover:shadow-md'
                }`}
              >
                <h3
                  className={`mb-2 text-xs font-semibold uppercase tracking-wide ${
                    tier.highlight ? 'text-indigo-200' : 'text-zinc-500'
                  }`}
                >
                  {tier.name}
                </h3>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className={`text-sm ${tier.highlight ? 'text-indigo-200' : 'text-zinc-400'}`}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <ul className="mb-8 space-y-2">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-center gap-2 text-sm ${
                        tier.highlight ? 'text-indigo-100' : 'text-zinc-600'
                      }`}
                    >
                      <span className={tier.highlight ? 'text-indigo-300' : 'text-indigo-500'}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {tier.plan ? (
                  <Link
                    href={`/api/checkout/${tier.plan}`}
                    className={`block w-full rounded-full py-2.5 text-center text-sm font-semibold transition ${
                      tier.highlight
                        ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                ) : (
                  <button
                    className={`w-full rounded-full py-2.5 text-sm font-semibold transition ${
                      tier.highlight
                        ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {tier.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 py-10 text-center text-sm text-zinc-400">
        {t.footer}
      </footer>
    </div>
  )
}
