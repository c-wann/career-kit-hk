import Image from "next/image";
import Link from "next/link";

function ProductButton({ plan, label }: { plan: string; label: string }) {
  return (
    <Link
      href={`/api/checkout/${plan}`}
      className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/90"
    >
      {label}
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="w-full border-b border-zinc-200/70 bg-white/80 backdrop-blur dark:border-zinc-800/70 dark:bg-black/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9">
              <Image src="/favicon.ico" alt="Logo" fill className="rounded" />
            </div>
            <div>
              <div className="text-sm font-semibold">Career Kit HK</div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">CV / SOP 工具包</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#pricing"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              FAQ
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-6 pt-12 pb-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200">
                一鍵生成 • 中英雙語 • 可重複使用
              </div>

              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                由「空白」到「可用」CV / SOP — 5 分鐘完成
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                針對香港求職同接案情境：提供模板 + 寫作提示，令你快速整理重點、寫得更清晰、面試更有底。
                <br />
                <span className="text-sm">（基本網店部署完成：而家只差你填入 Lemon Squeezy 變體 ID。）</span>
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <ProductButton plan="onetime" label="立即購買（一次性）" />
                <a
                  href="#pricing"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-50 dark:hover:bg-zinc-900/70"
                >
                  睇方案 / See pricing
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
                  Licence keys 自動發送
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200">
                  Checkout URL 由 API 產生
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
              <div className="text-sm font-semibold">示範輸出（Preview）</div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40">
                  <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">CV 改寫示例</div>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    把「做咗好多嘢」變成「可量化成果」：
                    <br />
                    <span className="text-zinc-700 dark:text-zinc-200">
                      • 提升回覆率 +23% • 縮短交付時間 -30%
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950/40">
                  <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">SOP 生成示例</div>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    由流程圖 → 步驟清單 → 每一步嘅輸入/輸出/注意事項。
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  Tip：而家需要做嘅只係部署網站同綁定 Lemon Squeezy 變體 ID。
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-5xl px-6 pb-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Pricing 方案</h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                先用基本網店接到「買」；之後再根據銷售反饋加功能同訂閱。
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
              <div className="text-sm font-semibold">一次性（CV / SOP 工具包）</div>
              <div className="mt-3 flex items-end gap-2">
                <div className="text-4xl font-semibold">HKD 399</div>
                <div className="pb-1 text-sm text-zinc-600 dark:text-zinc-300">one-time</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <li>• Licence keys 立即發送</li>
                <li>• 中英寫作提示 + 模板</li>
                <li>• 可重複用（無限次生成）</li>
              </ul>
              <div className="mt-6">
                <ProductButton plan="onetime" label="Buy once" />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30 lg:-mt-2">
              <div className="absolute right-4 top-4 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                最受歡迎
              </div>
              <div className="text-sm font-semibold">月費（更新 + 新模板）</div>
              <div className="mt-3 flex items-end gap-2">
                <div className="text-4xl font-semibold">HKD 149</div>
                <div className="pb-1 text-sm text-zinc-600 dark:text-zinc-300">/ month</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <li>• 每月新增模板 / 提示</li>
                <li>• 優先出新功能</li>
              </ul>
              <div className="mt-6">
                <ProductButton plan="monthly" label="Buy monthly" />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
              <div className="text-sm font-semibold">年費（最佳價）</div>
              <div className="mt-3 flex items-end gap-2">
                <div className="text-4xl font-semibold">HKD 999</div>
                <div className="pb-1 text-sm text-zinc-600 dark:text-zinc-300">/ year</div>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <li>• 年度更新 + 新模板</li>
                <li>• 比月費更省</li>
              </ul>
              <div className="mt-6">
                <ProductButton plan="annual" label="Buy yearly" />
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto w-full max-w-5xl px-6 pb-16">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
            <h2 className="text-2xl font-semibold">FAQ</h2>
            <div className="mt-4 space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
              <p>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">Q：而家可以直接買嗎？</span>
                <br />
                A：前端部署好咗；真正付款要你填入 Lemon Squeezy 變體 ID（以及 API Key / Store ID）。
              </p>
              <p>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">Q：點解我買完會去邊？</span>
                <br />
                A：我會用你 .env 裡嘅 NEXT_PUBLIC_APP_URL 當作 redirect URL。
              </p>
              <p>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">Q：我想用自己 domain，點做？</span>
                <br />
                A：部署到 Vercel/Azure 之後，照住佢要求做 DNS（CNAME / A / AAAA）。我可以逐步同你對。
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/70 bg-white/80 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800/70 dark:bg-black/60 dark:text-zinc-400">
        © {new Date().getFullYear()} Career Kit HK. All rights reserved.
      </footer>
    </div>
  );
}
