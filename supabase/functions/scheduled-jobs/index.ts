import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ScheduledJob {
  type: "pre_trip_reminder" | "review_reminder" | "subscription_expiry";
  hoursBeforeEvent: number;
}

serve(async (req) => {
  // This function should be called via a cron job (e.g., every 6 hours)
  // Set up in Supabase dashboard or via external cron service

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Get all upcoming trips (departing in 48 hours)
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 48 hours from now

    const { data: upcomingTrips } = await supabase
      .from("batch_bookings")
      .select(`
        id,
        user_id,
        batch:batch_id(
          id,
          departure_date,
          package:package_id(title),
          checkin_time,
          meeting_point
        )
      `)
      .eq("status", "confirmed")
      .gte("batch.departure_date", now.toISOString())
      .lte("batch.departure_date", reminderTime.toISOString());

    // Send reminder emails for upcoming trips
    if (upcomingTrips && upcomingTrips.length > 0) {
      for (const booking of upcomingTrips) {
        if (!booking.batch) continue;

        try {
          await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-reminder-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              },
              body: JSON.stringify({
                bookingId: booking.id,
                userId: booking.user_id,
                packageTitle: booking.batch.package?.title || "Your Package",
                departureDate: booking.batch.departure_date,
                checkinTime: booking.batch.checkin_time || "8:00 AM",
                meetingPoint: booking.batch.meeting_point || "Hotel Lobby",
              }),
            }
          );

          console.log(`Pre-trip reminder sent for booking ${booking.id}`);
        } catch (error) {
          console.error(`Failed to send reminder for booking ${booking.id}:`, error);
        }
      }
    }

    // Get all completed trips from yesterday to today
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { data: completedTrips } = await supabase
      .from("batch_bookings")
      .select(`
        id,
        user_id,
        batch:batch_id(
          id,
          return_date,
          package:package_id(title)
        )
      `)
      .eq("status", "completed")
      .gte("batch.return_date", yesterday.toISOString())
      .lte("batch.return_date", now.toISOString());

    // Send review reminders for completed trips
    if (completedTrips && completedTrips.length > 0) {
      for (const booking of completedTrips) {
        if (!booking.batch) continue;

        try {
          await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-review-reminder`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              },
              body: JSON.stringify({
                userId: booking.user_id,
                bookingId: booking.id,
                packageTitle: booking.batch.package?.title || "Your Package",
              }),
            }
          );

          console.log(`Review reminder sent for booking ${booking.id}`);
        } catch (error) {
          console.error(`Failed to send review reminder for booking ${booking.id}:`, error);
        }
      }
    }

    // Check for expiring subscriptions (expiring in 7 days)
    const subscriptionExpiryTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: expiringSubscriptions } = await supabase
      .from("user_subscriptions")
      .select(`
        id,
        user_id,
        expires_at,
        tier:tier_id(name)
      `)
      .eq("status", "active")
      .gte("expires_at", now.toISOString())
      .lte("expires_at", subscriptionExpiryTime.toISOString());

    // Send subscription expiry reminders
    if (expiringSubscriptions && expiringSubscriptions.length > 0) {
      for (const subscription of expiringSubscriptions) {
        const { data: { user } } = await supabase.auth.admin.getUserById(subscription.user_id);
        if (!user?.email) continue;

        const expiryDate = new Date(subscription.expires_at);
        const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="UTF-8">
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                  .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: white; padding: 30px; }
                  .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>Your Subscription Expiring Soon</h1>
                  </div>
                  <div class="content">
                      <p>Hi,</p>
                      <p>Your <strong>${subscription.tier?.name || "Premium"}</strong> subscription will expire in <strong>${daysLeft} days</strong>.</p>
                      <p>Don't miss out on your exclusive benefits and discounts!</p>
                      <a href="${Deno.env.get("APP_URL") || "https://travyntra.com"}/profile/subscriptions" class="button">Renew Now</a>
                      <p>Your subscription gives you:</p>
                      <ul>
                          <li>Exclusive discounts on all packages</li>
                          <li>Priority customer support</li>
                          <li>Early access to new adventures</li>
                      </ul>
                  </div>
              </div>
          </body>
          </html>
        `;

        try {
          await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({
              to: user.email,
              subject: `Your ${subscription.tier?.name || "Premium"} Subscription Expires in ${daysLeft} Days`,
              html: emailHtml,
            }),
          });

          console.log(`Subscription expiry reminder sent to ${user.email}`);
        } catch (error) {
          console.error(`Failed to send subscription reminder to ${user.email}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Scheduled jobs completed",
        reminders_sent: {
          pre_trip: upcomingTrips?.length || 0,
          review: completedTrips?.length || 0,
          subscription_expiry: expiringSubscriptions?.length || 0,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in scheduled jobs:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
