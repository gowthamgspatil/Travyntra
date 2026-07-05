import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BookingData {
  userId: string;
  batchId: string;
  packageTitle: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  addons: string[];
  totalAmount: number;
  walletUsed: number;
  paymentMethod?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bookingData: BookingData = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch user email
    const { data: { user } } = await supabase.auth.admin.getUserById(bookingData.userId);
    if (!user?.email) {
      throw new Error("User not found or email not available");
    }

    // Fetch booking details
    const { data: booking } = await supabase
      .from("batch_bookings")
      .select("id, created_at")
      .eq("batch_id", bookingData.batchId)
      .eq("user_id", bookingData.userId)
      .single();

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Fetch user profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", bookingData.userId)
      .single();

    const userName = profile?.full_name || user.email.split("@")[0];
    const bookingId = booking.id;
    const baseUrl = Deno.env.get("APP_URL") || "https://travyntra.com";

    const confirmationEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .header p { margin: 10px 0 0 0; opacity: 0.9; }
              .content { background: white; padding: 30px; }
              .booking-details { background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .detail-row { display: flex; justify-content: space-between; margin: 12px 0; }
              .detail-label { font-weight: bold; color: #555; }
              .detail-value { color: #333; }
              .addon-list { list-style: none; padding: 0; }
              .addon-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
              .addon-list li:last-child { border-bottom: none; }
              .price-section { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .price-row { display: flex; justify-content: space-between; margin: 10px 0; }
              .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #667eea; border-top: 2px solid #ddd; padding-top: 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
              .footer a { color: #667eea; text-decoration: none; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>✓ Booking Confirmed!</h1>
                  <p>Your adventure awaits</p>
              </div>
              
              <div class="content">
                  <p>Hi <strong>${userName}</strong>,</p>
                  <p>Thank you for booking with Travyntra! Your booking has been confirmed and payment has been processed successfully.</p>
                  
                  <div class="booking-details">
                      <h3 style="margin-top: 0;">Booking Details</h3>
                      <div class="detail-row">
                          <span class="detail-label">Booking ID:</span>
                          <span class="detail-value">${bookingId}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Package:</span>
                          <span class="detail-value">${bookingData.packageTitle}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Departure:</span>
                          <span class="detail-value">${new Date(bookingData.departureDate).toLocaleDateString()}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Return:</span>
                          <span class="detail-value">${new Date(bookingData.returnDate).toLocaleDateString()}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Travelers:</span>
                          <span class="detail-value">${bookingData.travelers} person(s)</span>
                      </div>
                  </div>
                  
                  ${bookingData.addons && bookingData.addons.length > 0 ? `
                  <h4>Add-ons Selected:</h4>
                  <ul class="addon-list">
                      ${bookingData.addons.map(addon => `<li>• ${addon}</li>`).join('')}
                  </ul>
                  ` : ''}
                  
                  <div class="price-section">
                      <h4>Payment Summary</h4>
                      <div class="price-row">
                          <span>Package Price:</span>
                          <span>₹${bookingData.totalAmount}</span>
                      </div>
                      ${bookingData.walletUsed > 0 ? `
                      <div class="price-row">
                          <span>Wallet Used:</span>
                          <span>-₹${bookingData.walletUsed}</span>
                      </div>
                      ` : ''}
                      <div class="total-row">
                          <span>Total Amount Paid:</span>
                          <span>₹${bookingData.totalAmount - bookingData.walletUsed}</span>
                      </div>
                  </div>
                  
                  <p><strong>What's Next?</strong></p>
                  <ul>
                      <li>Check your itinerary and prepare for your adventure</li>
                      <li>Review our pre-trip guidelines and packing list</li>
                      <li>Contact us if you have any questions</li>
                  </ul>
                  
                  <a href="${baseUrl}/profile" class="button">View Your Booking</a>
                  
                  <p style="margin-top: 30px; color: #666;">
                      Have questions? <a href="mailto:support@travyntra.com" style="color: #667eea;">Contact our support team</a> or reply to this email.
                  </p>
              </div>
              
              <div class="footer">
                  <p>&copy; 2025 Travyntra. All rights reserved.</p>
                  <p><a href="${baseUrl}/profile">Manage Booking</a> | <a href="#">Cancellation Policy</a> | <a href="#">Contact Us</a></p>
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
          subject: `Booking Confirmed - ${bookingData.packageTitle}`,
          html: confirmationEmailHtml,
        }),
      }
    );

    if (!emailResponse.ok) {
      console.error("Failed to send confirmation email:", await emailResponse.text());
      throw new Error("Failed to send email");
    }

    // Log email event for tracking
    await supabase.from("email_logs").insert({
      user_id: bookingData.userId,
      booking_id: bookingId,
      email_type: "booking_confirmation",
      recipient: user.email,
      sent_at: new Date(),
      status: "sent",
    });

    return new Response(
      JSON.stringify({ success: true, message: "Confirmation email sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
