import { NextResponse } from "next/server";

type Plan = "onetime" | "monthly" | "annual";

function getPlanVariantId(plan: Plan): string | undefined {
  switch (plan) {
    case "onetime":
      return process.env.NEXT_PUBLIC_PRODUCT_ONETIME_VARIANT_ID ?? process.env.PRODUCT_ONETIME_VARIANT_ID;
    case "monthly":
      return process.env.NEXT_PUBLIC_PRODUCT_MONTHLY_VARIANT_ID ?? process.env.PRODUCT_MONTHLY_VARIANT_ID;
    case "annual":
      return process.env.NEXT_PUBLIC_PRODUCT_ANNUAL_VARIANT_ID ?? process.env.PRODUCT_ANNUAL_VARIANT_ID;
  }
}

function getStoreId(): string | undefined {
  return process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID ?? process.env.LEMONSQUEEZY_STORE_ID;
}

export async function GET(
  _req: Request,
  ctx: {
    params: Promise<{ plan: string }>;
  }
) {
  const { plan: planRaw } = await ctx.params;
  const plan = planRaw as Plan;

  if (!planRaw || (plan !== "onetime" && plan !== "monthly" && plan !== "annual")) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const storeId = getStoreId();
  const variantId = getPlanVariantId(plan);

  if (!apiKey) {
    return NextResponse.json({ error: "Missing LEMON_SQUEEZY_API_KEY" }, { status: 500 });
  }
  if (!storeId) {
    return NextResponse.json(
      { error: "Missing LEMON_SQUEEZY_STORE_ID (or NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID)" },
      { status: 500 }
    );
  }
  if (!variantId) {
    return NextResponse.json({ error: `Missing variant id for plan=${plan}` }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const redirectUrl = appUrl ? `${appUrl}/` : undefined;

  const payload: any = {
    data: {
      type: "checkouts",
      relationships: {
        store: {
          data: {
            type: "stores",
            id: storeId,
          },
        },
        variant: {
          data: {
            type: "variants",
            id: String(variantId),
          },
        },
      },
    },
  };

  if (redirectUrl) {
    payload.data.attributes = {
      product_options: {
        redirect_url: redirectUrl,
      },
    };
  }

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      {
        error: "LemonSqueezy create-checkout failed",
        status: res.status,
        body: text,
      },
      { status: 502 }
    );
  }

  const json = (await res.json().catch(() => ({}))) as any;
  const checkoutUrl = json?.data?.attributes?.url;

  if (!checkoutUrl || typeof checkoutUrl !== "string") {
    return NextResponse.json({ error: "Missing checkout url in response" }, { status: 502 });
  }

  return NextResponse.redirect(checkoutUrl);
}
