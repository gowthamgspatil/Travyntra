import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  userId: string;
  type:
    | "booking_confirmation"
    | "payment_success"
    | "booking_cancelled"
    | "trip_reminder"
    | "review_reminder"
    | "referral_reward"
    | "general";
  title: string;
  message: string;
  data?: Record<string, any>;
  expiresIn?: number; // Hours until notification expires
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notificationRequest: NotificationRequest = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate expiration date
    let expiresAt: Date | null = null;
    if (notificationRequest.expiresIn) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + notificationRequest.expiresIn);
    }

    // Create notification
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: notificationRequest.userId,
        type: notificationRequest.type,
        title: notificationRequest.title,
        message: notificationRequest.message,
        data: notificationRequest.data || {},
        read: false,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    // Broadcast notification to user via Supabase realtime
    // (Client will subscribe to their user channel)
    await supabase.realtime.invoke("send_notification", {
      user_id: notificationRequest.userId,
      notification: notification,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification created successfully",
        notificationId: notification.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
