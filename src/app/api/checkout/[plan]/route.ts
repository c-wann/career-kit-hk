import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require("stripe");

type Plan = "onetime" | "monthly" | "annual";

export const runtime = "nodejs";

function getPlanVariantId(plan: Plan): string | undefined {
  switch (plan) {
    case "onetime":
      return process.env.STRIPE_PRICE_ID_ONETIME ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONETIME;
    case "monthly":
      return process.env.STRIPE_PRICE_ID_MONTHLY ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;
    case "annual":
      return process.env.STRIPE_PRICE_ID_ANNUAL ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL;
  }
}

function getMode(plan: Plan): "subscription" | "payment" {
  if (plan === "monthly" || plan === "annual") return "subscription";
  return "payment";
}

export async function GET(_req: Request, ctx: { params: Promise<{ plan: string }> }) {
  const { plan: planRaw } = await ctx.params;
  const plan = planRaw as Plan;

  if (!planRaw || (plan !== "onetime" && plan !== "monthly" && plan !== "annual")) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }

  const priceId = getPlanVariantId(plan);
  if (!priceId) {
    return NextResponse.json({ error: `Missing Stripe Price ID for plan=${plan}` }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const mode = getMode(plan);
  const successUrl = `${appUrl}/deliver?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appUrl}/`;

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      plan,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    // Helpful for stable customer linkage.
    customer_creation: "always",
    // For subscription mode, this gives you subscription + renewals in Stripe.
    allow_promotion_codes: false,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return session.url" }, { status: 502 });
  }

  return NextResponse.redirect(session.url);
}
