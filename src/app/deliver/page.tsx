import { getLicenseByCheckoutSessionId } from "@/lib/licenseStore";
import Link from "next/link";

export default async function Deliver({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-xl font-semibold">License 未能載入</div>
        <div className="text-sm text-zinc-600">缺少 session_id。</div>
        <Link href="/" className="underline text-sm">返回首頁</Link>
      </div>
    );
  }

  const row = await getLicenseByCheckoutSessionId(sessionId);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/30">
        <div className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Delivery</div>
        <div className="mt-2 text-2xl font-semibold">你的 Licence Key</div>

        {!row ? (
          <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
            依然未收到 webhook 配對。
            <br />
            你可以稍等 10-30 秒再重新整理，或者聯絡我（我會檢查 webhook log）。
          </div>
        ) : (
          <div className="mt-4">
            <div className="text-xs text-zinc-500">Plan</div>
            <div className="text-sm text-zinc-800 dark:text-zinc-100">{row.plan ?? "unknown"}</div>

            <div className="mt-3 text-xs text-zinc-500">Licence Key</div>
            <div className="mt-1 break-all rounded-xl bg-zinc-100 px-4 py-3 font-mono text-sm dark:bg-zinc-800">
              {row.licenseKey}
            </div>

            <div className="mt-4 text-xs text-zinc-500">
              （MVP 版本：key 係由 webhook 分配。正式版建議換成 DB。）
            </div>
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/90"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
