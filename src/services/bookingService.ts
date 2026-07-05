// Frontend service for interacting with backend functions

import { supabase } from "@/integrations/supabase/client";
import {
  BookingConfirmation,
  CancellationDetails,
  RefundRequest,
  ReferralRewardData,
  NotificationData,
} from "@/types/services";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface FunctionResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

async function callEdgeFunction<T>(
  functionName: string,
  payload: Record<string, any>
): Promise<FunctionResponse<T>> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Function call failed");
    }

    return await response.json();
  } catch (error: any) {
    console.error(`Error calling ${functionName}:`, error);
    return {
      success: false,
      error: error.message || "An error occurred",
    };
  }
}

// Email Services

export async function sendBookingConfirmation(
  data: BookingConfirmation
): Promise<FunctionResponse<void>> {
  return callEdgeFunction("send-booking-confirmation", data);
}

export async function sendCancellationEmail(
  data: CancellationDetails
): Promise<FunctionResponse<void>> {
  return callEdgeFunction("send-cancellation-email", data);
}

export async function sendReminderEmail(data: {
  bookingId: string;
  userId: string;
  packageTitle: string;
  departureDate: string;
  checkinTime?: string;
  meetingPoint?: string;
}): Promise<FunctionResponse<void>> {
  return callEdgeFunction("send-reminder-email", data);
}

export async function sendReviewReminder(data: {
  userId: string;
  bookingId: string;
  packageTitle: string;
}): Promise<FunctionResponse<void>> {
  return callEdgeFunction("send-review-reminder", data);
}

// Refund Services

export async function processRefund(
  data: RefundRequest
): Promise<FunctionResponse<{ refundId: string; amount: number; status: string }>> {
  return callEdgeFunction("process-refund", data);
}

// Referral Services

export async function processReferralReward(
  data: ReferralRewardData
): Promise<FunctionResponse<{ rewardAmount: number; newWalletBalance: number }>> {
  return callEdgeFunction("process-referral-reward", data);
}

// Notification Services

export async function createNotification(
  data: NotificationData
): Promise<FunctionResponse<{ notificationId: string }>> {
  return callEdgeFunction("create-notification", data);
}

// Fetch notifications for current user
export async function getNotifications(
  limit: number = 20,
  offset: number = 0
) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data;
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }

  return true;
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }

  return true;
}

// Get user's wallet balance
export async function getWalletBalance(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching wallet balance:", error);
    return 0;
  }

  return data?.wallet_balance || 0;
}

// Get referral code
export async function getReferralCode(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching referral code:", error);
    return null;
  }

  return data?.referral_code;
}

// Get user's active subscriptions
export async function getActiveSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*, subscription_tiers(*)")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }

  return data;
}

// Get all subscription tiers
export async function getSubscriptionTiers() {
  const { data, error } = await supabase
    .from("subscription_tiers")
    .select("*")
    .order("price", { ascending: true });

  if (error) {
    console.error("Error fetching subscription tiers:", error);
    return [];
  }

  return data;
}

// Get user's referrals
export async function getUserReferrals(userId: string) {
  const { data, error } = await supabase
    .from("referrals")
    .select("*, referrer_id, referred_id")
    .or(`referrer_id.eq.${userId},referred_id.eq.${userId}`);

  if (error) {
    console.error("Error fetching referrals:", error);
    return [];
  }

  return data;
}

// Get booking cancellations
export async function getBookingCancellations(userId: string) {
  const { data, error } = await supabase
    .from("cancellations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cancellations:", error);
    return [];
  }

  return data;
}

// Get payment receipts
export async function getPaymentReceipts(userId: string) {
  const { data, error } = await supabase
    .from("payment_receipts")
    .select("*")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false });

  if (error) {
    console.error("Error fetching payment receipts:", error);
    return [];
  }

  return data;
}

// Real-time notification listener
export function subscribeToNotifications(
  userId: string,
  callback: (notification: any) => void
) {
  const subscription = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
}
