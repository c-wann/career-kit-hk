// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require("stripe");
import { NextResponse } from "next/server";
import { ensureLicenseForCustomer, recordCheckoutSession } from "../../../lib/licenseStore";

export const runtime = "nodejs";

type Plan = "onetime" | "monthly" | "annual";

function getPlan(planRaw: string | undefined): Plan | undefined {
  if (!planRaw) return undefined;
  if (planRaw === "onetime" || planRaw === "monthly" || planRaw === "annual") return planRaw;
  return undefined;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }

  // NOTE: Stripe client must be created only at request time.
  // Otherwise build-time evaluation will crash when env vars are absent.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: "Webhook signature verification failed", detail: String(err?.message ?? err) }, { status: 400 });
  }

  // We only need to allocate license once when checkout completes.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const checkoutSessionId = session.id;

    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;

    const plan = getPlan(session.metadata?.plan);

    if (checkoutSessionId && customerId) {
      const licenseKey = await ensureLicenseForCustomer({ customerId, plan });

      await recordCheckoutSession({
        checkoutSessionId,
        licenseKey,
        plan,
        customerId,
        subscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.toString(),
      });
    }
  }

  return NextResponse.json({ received: true, type: event.type });
}
