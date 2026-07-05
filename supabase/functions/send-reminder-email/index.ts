import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReminderRequest {
  bookingId: string;
  userId: string;
  packageTitle: string;
  departureDate: string;
  checkinTime?: string;
  meetingPoint?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, userId, packageTitle, departureDate, checkinTime, meetingPoint }: ReminderRequest = await req.json();
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
    const baseUrl = Deno.env.get("APP_URL") || "https://travyntra.com";
    const departDate = new Date(departureDate);
    
    const reminderEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: white; padding: 30px; }
              .reminder-box { background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .detail-row { display: flex; justify-content: space-between; margin: 12px 0; }
              .detail-label { font-weight: bold; color: #555; }
              .detail-value { color: #333; }
              .checklist { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
              .footer a { color: #667eea; text-decoration: none; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Your Adventure Starts Soon!</h1>
                  <p>Get ready for an amazing journey</p>
              </div>
              
              <div class="content">
                  <p>Hi ${userName},</p>
                  <p>We're excited to have you joining us! Your trip is just around the corner. Here are the important details you need to know.</p>
                  
                  <div class="reminder-box">
                      <h3 style="margin-top: 0;">Trip Details</h3>
                      <div class="detail-row">
                          <span class="detail-label">Package:</span>
                          <span class="detail-value">${packageTitle}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Departure Date:</span>
                          <span class="detail-value">${departDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      ${checkinTime ? `
                      <div class="detail-row">
                          <span class="detail-label">Check-in Time:</span>
                          <span class="detail-value">${checkinTime}</span>
                      </div>
                      ` : ''}
                      ${meetingPoint ? `
                      <div class="detail-row">
                          <span class="detail-label">Meeting Point:</span>
                          <span class="detail-value">${meetingPoint}</span>
                      </div>
                      ` : ''}
                  </div>
                  
                  <div class="checklist">
                      <h3 style="margin-top: 0; color: #92400e;">📋 Pre-Trip Checklist</h3>
                      <ul style="margin: 12px 0; padding-left: 20px;">
                          <li>✓ Confirm your travel documents and valid ID</li>
                          <li>✓ Check weather forecast and pack accordingly</li>
                          <li>✓ Review our complete pre-trip guidelines</li>
                          <li>✓ Download this email as your booking confirmation</li>
                          <li>✓ Arrive 15 minutes early at the meeting point</li>
                          <li>✓ Bring a printed or digital copy of your booking confirmation</li>
                      </ul>
                  </div>
                  
                  <p><strong>Important Reminders:</strong></p>
                  <ul>
                      <li>Please ensure all passengers have valid identification</li>
                      <li>Reach the meeting point at least 15 minutes before departure</li>
                      <li>Bring comfortable clothing and required medications</li>
                      <li>Contact us immediately if you have any last-minute questions</li>
                  </ul>
                  
                  <a href="${baseUrl}/profile" class="button">View Full Itinerary</a>
                  
                  <p style="margin-top: 30px; color: #666;">
                      Have questions? <a href="mailto:support@travyntra.com">Contact our support team</a> or call us during business hours.
                  </p>
              </div>
              
              <div class="footer">
                  <p>&copy; 2025 Travyntra. All rights reserved.</p>
                  <p><a href="${baseUrl}/profile">My Bookings</a> | <a href="#">FAQ</a> | <a href="#">Contact Us</a></p>
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
          subject: `Reminder: Your ${packageTitle} Adventure Starts Soon!`,
          html: reminderEmailHtml,
        }),
      }
    );

    if (!emailResponse.ok) {
      console.error("Failed to send reminder email:", await emailResponse.text());
    }

    // Log email event
    await supabase.from("email_logs").insert({
      user_id: userId,
      booking_id: bookingId,
      email_type: "pre_trip_reminder",
      recipient: user.email,
      subject: `Reminder: Your ${packageTitle} Adventure Starts Soon!`,
      sent_at: new Date(),
      status: emailResponse.ok ? "sent" : "failed",
    });

    return new Response(
      JSON.stringify({ success: true, message: "Reminder email sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending reminder email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
