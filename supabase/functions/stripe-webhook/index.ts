import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    // If we have a webhook secret and signature, verify
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // For development / testing without webhook signature verification
      event = JSON.parse(body) as Stripe.Event;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid" && session.metadata?.user_id && session.metadata?.batch_id) {
        
        const travelersCount = parseInt(session.metadata.traveler_count || "1", 10);
        const addons = JSON.parse(session.metadata.addons || "[]");
        const walletUsed = parseFloat(session.metadata.wallet_used || "0");
        const totalAmount = parseFloat(session.metadata.total_amount || "0");

        // Call the RPC to finalize the booking and deduct wallet
        const { error } = await supabaseAdmin.rpc("checkout_batch", {
          p_batch_id: session.metadata.batch_id,
          p_user_id: session.metadata.user_id,
          p_travelers_count: travelersCount,
          p_addons: addons,
          p_wallet_used: walletUsed,
          p_total_amount: totalAmount
        });

        if (error) {
          console.error("Failed to checkout batch:", error);
        } else {
          // Additionally, update the old booking to paid if this was from the legacy system (optional fallback)
          if (session.metadata.destination) {
            await supabaseAdmin.from("bookings").update({ status: "paid" })
              .eq("user_id", session.metadata.user_id)
              .eq("destination", session.metadata.destination)
              .eq("status", "pending")
              .order("created_at", { ascending: false }).limit(1);
          }
          console.log(`Booking updated mapped to batch ${session.metadata.batch_id} for user ${session.metadata.user_id}`);

          // Send booking confirmation email
          try {
            const emailResponse = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-booking-confirmation`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                },
                body: JSON.stringify({
                  userId: session.metadata.user_id,
                  batchId: session.metadata.batch_id,
                  packageTitle: session.metadata.package_title || "Your Package",
                  departureDate: session.metadata.departure_date || new Date().toISOString(),
                  returnDate: session.metadata.return_date || new Date().toISOString(),
                  travelers: travelersCount,
                  addons: addons,
                  totalAmount: totalAmount,
                  walletUsed: walletUsed,
                  paymentMethod: "Stripe Card",
                }),
              }
            );

            if (!emailResponse.ok) {
              console.error("Failed to send confirmation email:", await emailResponse.text());
            } else {
              console.log("Booking confirmation email sent successfully");
            }
          } catch (emailError) {
            console.error("Error calling send-booking-confirmation:", emailError);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
