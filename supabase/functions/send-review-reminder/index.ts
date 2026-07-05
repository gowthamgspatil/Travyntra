import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReviewReminderRequest {
  userId: string;
  bookingId: string;
  packageTitle: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, bookingId, packageTitle }: ReviewReminderRequest = await req.json();
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

    const reviewEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: white; padding: 30px; }
              .stars { font-size: 28px; margin: 15px 0; }
              .review-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
              .review-item { margin: 12px 0; padding-left: 20px; }
              .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .incentive { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
              .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
              .footer a { color: #f5576c; text-decoration: none; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>How Was Your Experience?</h1>
                  <p>Your feedback helps us improve</p>
              </div>
              
              <div class="content">
                  <p>Hi ${userName},</p>
                  <p>We hope you had an amazing time on your recent adventure with us on <strong>${packageTitle}</strong>! Your feedback is incredibly valuable to us and helps other travelers make informed decisions.</p>
                  
                  <div class="stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
                  
                  <div class="review-box">
                      <h3 style="margin-top: 0;">Share Your Feedback On:</h3>
                      <div class="review-item">📍 <strong>Experience Quality</strong> - Overall highlights and memorable moments</div>
                      <div class="review-item">🏨 <strong>Accommodations</strong> - Comfort, cleanliness, and amenities</div>
                      <div class="review-item">🍽️ <strong>Food & Meals</strong> - Quality and variety of meals included</div>
                      <div class="review-item">👨‍🏫 <strong>Guide & Staff</strong> - Professionalism and knowledge</div>
                      <div class="review-item">💰 <strong>Value for Money</strong> - Was it worth the price?</div>
                      <div class="review-item">💡 <strong>Suggestions</strong> - How can we improve?</div>
                  </div>
                  
                  <div class="incentive">
                      <strong>🎁 Loyalty Reward</strong>
                      <p style="margin: 8px 0;">Write a review and earn <strong>₹500</strong> in wallet credits for your next booking!</p>
                  </div>
                  
                  <p style="text-align: center; margin-top: 30px;">
                      <a href="${baseUrl}/destinations/review/${bookingId}" class="button">Write Your Review</a>
                  </p>
                  
                  <p style="margin-top: 30px; color: #666; font-size: 14px;">
                      Your review will help us maintain our quality standards and help fellow travelers discover amazing experiences. Thank you for being part of the Travyntra family!
                  </p>
                  
                  <p style="margin-top: 20px; color: #666; font-size: 14px;">
                      Have any issues with your trip? <a href="mailto:support@travyntra.com">Contact us</a> and we'll make it right.
                  </p>
              </div>
              
              <div class="footer">
                  <p>&copy; 2025 Travyntra. All rights reserved.</p>
                  <p><a href="${baseUrl}/packages">Browse More Packages</a> | <a href="#">Reviews Policy</a> | <a href="#">Contact Us</a></p>
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
          subject: `Share Your ${packageTitle} Experience & Earn Rewards!`,
          html: reviewEmailHtml,
        }),
      }
    );

    if (!emailResponse.ok) {
      console.error("Failed to send review reminder:", await emailResponse.text());
    }

    // Log email event
    await supabase.from("email_logs").insert({
      user_id: userId,
      booking_id: bookingId,
      email_type: "review_reminder",
      recipient: user.email,
      subject: `Share Your ${packageTitle} Experience & Earn Rewards!`,
      sent_at: new Date(),
      status: emailResponse.ok ? "sent" : "failed",
    });

    return new Response(
      JSON.stringify({ success: true, message: "Review reminder sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending review reminder:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
