import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] Assinatura inválida", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.CheckoutSession;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        await supabase.from("users")
          .update({
            plan: "pro",
            plan_status: "active",
            stripe_subscription_id: subscriptionId,
            messages_limit: -1,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await supabase.from("users")
          .update({
            plan: "free",
            plan_status: "inactive",
            stripe_subscription_id: null,
            messages_limit: 20,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const status = sub.status;

        await supabase.from("users")
          .update({ plan_status: status === "active" ? "active" : "inactive" })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook] Erro", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}