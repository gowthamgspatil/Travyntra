import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReferralRewardRequest {
  referrerId: string;
  referredId: string;
  bookingAmount: number;
  rewardPercentage?: number; // Default 10%
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      referrerId,
      referredId,
      bookingAmount,
      rewardPercentage = 10,
    }: ReferralRewardRequest = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate reward amount
    const rewardAmount = (bookingAmount * rewardPercentage) / 100;

    // Check if referral relationship exists
    const { data: existingReferral } = await supabase
      .from("referrals")
      .select("id, status")
      .eq("referrer_id", referrerId)
      .eq("referred_id", referredId)
      .single();

    if (!existingReferral) {
      throw new Error("Referral relationship not found");
    }

    // Update referral to completed
    const { data: referral } = await supabase
      .from("referrals")
      .update({
        status: "completed",
        reward_amount: rewardAmount,
        completed_at: new Date(),
      })
      .eq("id", existingReferral.id)
      .select()
      .single();

    // Add reward to referrer's wallet
    const { data: referrerProfile, error: referrerError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("user_id", referrerId)
      .single();

    if (referrerError) {
      throw new Error("Failed to fetch referrer profile");
    }

    const newWalletBalance = (referrerProfile?.wallet_balance || 0) + rewardAmount;

    await supabase
      .from("profiles")
      .update({ wallet_balance: newWalletBalance })
      .eq("user_id", referrerId);

    // Create notification for referrer
    await supabase.from("notifications").insert({
      user_id: referrerId,
      type: "referral_reward",
      title: "Referral Reward Earned!",
      message: `You earned ₹${rewardAmount} from your referral. Your new wallet balance is ₹${newWalletBalance}`,
      data: {
        referred_id: referredId,
        reward_amount: rewardAmount,
        booking_amount: bookingAmount,
      },
    });

    // Send reward notification email to referrer
    const { data: { user: referrerUser } } = await supabase.auth.admin.getUserById(referrerId);
    if (referrerUser?.email) {
      const { data: referrerProfileName } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", referrerId)
        .single();

      const referrerName = referrerProfileName?.full_name || referrerUser.email.split("@")[0];

      const rewardEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { background: white; padding: 30px; }
                .reward-box { background: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .reward-amount { font-size: 32px; font-weight: bold; color: #10b981; margin: 10px 0; }
                .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Referral Reward Earned!</h1>
                    <p>Your referral made a booking</p>
                </div>
                
                <div class="content">
                    <p>Hi ${referrerName},</p>
                    <p>Great news! Your referred friend has completed a booking with us, and you've earned a reward!</p>
                    
                    <div class="reward-box">
                        <p style="margin: 0; font-size: 14px;">Reward Amount</p>
                        <div class="reward-amount">₹${rewardAmount}</div>
                        <p style="margin: 10px 0 0 0; font-size: 14px;">Added to your wallet</p>
                    </div>
                    
                    <p><strong>Reward Details:</strong></p>
                    <ul>
                        <li>Booking Amount: ₹${bookingAmount}</li>
                        <li>Reward Percentage: ${rewardPercentage}%</li>
                        <li>Your Reward: ₹${rewardAmount}</li>
                        <li>New Wallet Balance: ₹${newWalletBalance}</li>
                    </ul>
                    
                    <p>You can use your wallet balance for your next booking or share your referral code to earn more rewards!</p>
                    
                    <a href="${Deno.env.get("APP_URL") || "https://travyntra.com"}/profile" class="button">View Your Wallet</a>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 14px;">
                        Keep referring friends and earn more! For every successful referral, you earn ${rewardPercentage}% of their booking amount.
                    </p>
                </div>
                
                <div class="footer">
                    <p>&copy; 2025 Travyntra. All rights reserved.</p>
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
            to: referrerUser.email,
            subject: `🎉 You've Earned ₹${rewardAmount} from a Referral!`,
            html: rewardEmailHtml,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send reward email:", emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Referral reward processed successfully",
        rewardAmount,
        newWalletBalance,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error processing referral reward:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
