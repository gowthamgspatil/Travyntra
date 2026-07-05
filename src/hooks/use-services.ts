// Custom React hooks for booking and notification services

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as bookingService from "@/services/bookingService";
import type { Notification } from "@/types/services";

// Hook for managing notifications
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await bookingService.getNotifications(50, 0);
      setNotifications(data || []);
      const unread = (data || []).filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const subscription = bookingService.subscribeToNotifications(user.id, (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      if (!newNotification.read) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const success = await bookingService.markNotificationAsRead(notificationId);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    const success = await bookingService.markAllNotificationsAsRead();
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

// Hook for managing wallet
export function useWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const walletBalance = await bookingService.getWalletBalance(user.id);
        setBalance(walletBalance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  return { balance, loading };
}

// Hook for managing referrals
export function useReferrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReferralData = async () => {
      setLoading(true);
      try {
        const [referralsData, code] = await Promise.all([
          bookingService.getUserReferrals(user.id),
          bookingService.getReferralCode(user.id),
        ]);
        setReferrals(referralsData || []);
        setReferralCode(code);
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user]);

  return { referrals, referralCode, loading };
}

// Hook for managing subscriptions
export function useSubscriptions() {
  const { user } = useAuth();
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [availableTiers, setAvailableTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const [active, tiers] = await Promise.all([
          bookingService.getActiveSubscriptions(user.id),
          bookingService.getSubscriptionTiers(),
        ]);
        setActiveSubscriptions(active || []);
        setAvailableTiers(tiers || []);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  return { activeSubscriptions, availableTiers, loading };
}

// Hook for cancellations and refunds
export function useCancellations() {
  const { user } = useAuth();
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCancellations = async () => {
      setLoading(true);
      try {
        const data = await bookingService.getBookingCancellations(user.id);
        setCancellations(data || []);
      } catch (error) {
        console.error("Error fetching cancellations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCancellations();
  }, [user]);

  return { cancellations, loading };
}

// Hook for payment receipts
export function usePaymentReceipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReceipts = async () => {
      setLoading(true);
      try {
        const data = await bookingService.getPaymentReceipts(user.id);
        setReceipts(data || []);
      } catch (error) {
        console.error("Error fetching payment receipts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [user]);

  return { receipts, loading };
}
