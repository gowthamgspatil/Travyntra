import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RefundRequest {
  bookingId: string;
  userId: string;
  stripeChargeId: string;
  refundAmount: number;
  reason: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, userId, stripeChargeId, refundAmount, reason }: RefundRequest = await req.json();
    
    if (!stripeChargeId || !refundAmount) {
      throw new Error("Missing required fields: stripeChargeId, refundAmount");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basial" as any,
    });

    // Create refund via Stripe
    const refund = await stripe.refunds.create({
      charge: stripeChargeId,
      amount: Math.round(refundAmount * 100), // Convert to paise
      reason: "requested_by_customer",
      metadata: {
        booking_id: bookingId,
        user_id: userId,
        reason: reason,
      },
    });

    // Record refund in database
    const { data: cancellation } = await supabase
      .from("cancellations")
      .insert({
        booking_id: bookingId,
        user_id: userId,
        reason: reason,
        refund_amount: refundAmount,
        refund_status: "processed",
        stripe_refund_id: refund.id,
        processed_at: new Date(),
      })
      .select()
      .single();

    // Update booking status
    await supabase
      .from("batch_bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    // Optionally update user's wallet if refund should go to wallet instead
    // await supabase
    //   .from("profiles")
    //   .update({ wallet_balance: sql`wallet_balance + ${refundAmount}` })
    //   .eq("user_id", userId);

    // Fetch user and send cancellation email
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (user?.email) {
      try {
        await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-cancellation-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({
              bookingId,
              userId,
              reason,
              refundAmount,
            }),
          }
        );
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Refund processed successfully",
        refundId: refund.id,
        amount: refundAmount,
        status: "processed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error processing refund:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
