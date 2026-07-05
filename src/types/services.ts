// Types for email and notification services

export interface BookingConfirmation {
  userId: string;
  batchId: string;
  packageTitle: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  addons: string[];
  totalAmount: number;
  walletUsed: number;
}

export interface CancellationDetails {
  bookingId: string;
  userId: string;
  reason: string;
  refundAmount: number;
}

export interface RefundRequest {
  bookingId: string;
  userId: string;
  stripeChargeId: string;
  refundAmount: number;
  reason: string;
}

export interface ReferralRewardData {
  referrerId: string;
  referredId: string;
  bookingAmount: number;
  rewardPercentage?: number;
}

export interface NotificationData {
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
  expiresIn?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export interface EmailLog {
  id: string;
  userId: string;
  bookingId?: string;
  emailType: string;
  recipient: string;
  subject?: string;
  sentAt: string;
  status: "sent" | "failed" | "pending";
  errorMessage?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  status: "active" | "cancelled" | "expired";
  startedAt: string;
  expiresAt?: string;
  stripeSubscriptionId?: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingPeriod: "monthly" | "yearly";
  features: string[];
  maxBookings?: number;
  discountPercentage: number;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  status: "pending" | "completed" | "cancelled";
  rewardAmount: number;
  completedAt?: string;
  createdAt: string;
}

export interface Cancellation {
  id: string;
  bookingId: string;
  userId: string;
  reason: string;
  refundAmount: number;
  refundStatus: "pending" | "processed" | "failed";
  stripeRefundId?: string;
  processedAt?: string;
}

export interface PaymentReceipt {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  stripeChargeId?: string;
  receiptUrl?: string;
  generatedAt: string;
}
