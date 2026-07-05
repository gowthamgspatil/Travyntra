import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CancellationRequest {
  bookingId: string;
  userId: string;
  reason: string;
  refundAmount: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, userId, reason, refundAmount }: CancellationRequest = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch user email and name
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    if (!user?.email) {
      throw new Error("User not found");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .single();

    const userName = profile?.full_name || user.email.split("@")[0];

    // Fetch booking details
    const { data: booking } = await supabase
      .from("batch_bookings")
      .select("id, status, created_at")
      .eq("id", bookingId)
      .eq("user_id", userId)
      .single();

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Fetch package details for context
    const { data: batch } = await supabase
      .from("batches")
      .select("package_id, departure_date")
      .eq("id", booking.id)
      .single();

    const baseUrl = Deno.env.get("APP_URL") || "https://travyntra.com";
    const refundDate = new Date();
    refundDate.setDate(refundDate.getDate() + 7); // Refund in 7 days

    const cancellationEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: white; padding: 30px; }
              .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
              .detail-row:last-child { border-bottom: none; }
              .detail-label { font-weight: bold; color: #555; }
              .detail-value { color: #333; }
              .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
              .footer a { color: #ef4444; text-decoration: none; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Booking Cancelled</h1>
                  <p>Your request has been processed</p>
              </div>
              
              <div class="content">
                  <p>Hi ${userName},</p>
                  <p>Your booking has been successfully cancelled.</p>
                  
                  <div class="alert">
                      <strong>Cancellation Details</strong>
                      <div class="detail-row" style="margin-top: 12px; border-bottom: none;">
                          <span class="detail-label">Booking ID:</span>
                          <span class="detail-value">${bookingId}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Refund Amount:</span>
                          <span style="color: #10b981; font-weight: bold;">₹${refundAmount}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Refund Processing:</span>
                          <span>${refundDate.toLocaleDateString()}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Reason:</span>
                          <span>${reason}</span>
                      </div>
                  </div>
                  
                  <h3>Refund Information</h3>
                  <ul>
                      <li>Your refund will be processed to your original payment method</li>
                      <li>Processing time: 5-7 business days</li>
                      <li>Refund amount includes all paid amounts minus applicable cancellation fees</li>
                      <li>You'll receive a confirmation once the refund is initiated</li>
                  </ul>
                  
                  <p style="margin-top: 30px;">We appreciate your understanding and hope to welcome you on a future adventure!</p>
                  
                  <p style="margin-top: 30px; color: #666;">
                      If you have any concerns about this cancellation, please <a href="mailto:support@travyntra.com">contact our support team</a>.
                  </p>
              </div>
              
              <div class="footer">
                  <p>&copy; 2025 Travyntra. All rights reserved.</p>
                  <p><a href="${baseUrl}/packages">Browse More Packages</a> | <a href="#">Cancellation Policy</a></p>
              </div>
          </div>
      </body>
      </html>
    `;

    // Send email via the send-email function
    const emailResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          to: user.email,
          subject: "Booking Cancellation Confirmation",
          html: cancellationEmailHtml,
        }),
      }
    );

    if (!emailResponse.ok) {
      console.error("Failed to send cancellation email:", await emailResponse.text());
    }

    // Log email event
    await supabase.from("email_logs").insert({
      user_id: userId,
      booking_id: bookingId,
      email_type: "cancellation_confirmation",
      recipient: user.email,
      subject: "Booking Cancellation Confirmation",
      sent_at: new Date(),
      status: emailResponse.ok ? "sent" : "failed",
    });

    return new Response(
      JSON.stringify({ success: true, message: "Cancellation email sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending cancellation email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
