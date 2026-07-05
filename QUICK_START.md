# Quick Start Guide - Production Features

Get your Travyntra booking platform production-ready in 5 minutes.

## ⚡ Essential Setup (5 minutes)

### 1. Environment Variables
Add these to your Supabase environment:

```env
RESEND_API_KEY=your_resend_api_key
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
APP_URL=https://travyntra.com
```

### 2. Run Database Migration
```bash
# Apply the new tables
supabase db push
# or manually upload: supabase/migrations/20260706000000_add_email_and_notification_system.sql
```

### 3. Test Email Function
```bash
# Test sending an email
curl -X POST https://your-supabase.com/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

---

## 🎯 5-Minute Feature Integration

### Add Notifications to Your Navbar
```tsx
import { NotificationCenter } from "@/components/NotificationCenter";

export function Navbar() {
  return (
    <header className="navbar">
      {/* ... other items ... */}
      <NotificationCenter />
    </header>
  );
}
```

### Show Wallet Balance
```tsx
import { useWallet } from "@/hooks/use-services";

export function UserMenu() {
  const { balance } = useWallet();
  return <span>Wallet: ₹{balance}</span>;
}
```

### Add Referral Info
```tsx
import { useReferrals } from "@/hooks/use-services";

export function ReferralCard() {
  const { referralCode, referrals } = useReferrals();
  const earned = referrals
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.reward_amount, 0);
    
  return (
    <div>
      <p>Share: {referralCode}</p>
      <p>Earned: ₹{earned}</p>
    </div>
  );
}
```

---

## 🚀 Deployment Steps

### 1. Verify All Functions Deploy
```bash
supabase functions deploy
```

Expected deployed functions:
- send-email ✅
- send-booking-confirmation ✅
- send-cancellation-email ✅
- send-reminder-email ✅
- send-review-reminder ✅
- process-refund ✅
- process-referral-reward ✅
- create-notification ✅
- scheduled-jobs ✅
- stripe-webhook (existing) ✅
- create-payment (existing) ✅

### 2. Test Full Payment Flow
1. Login as test user
2. Select package → Add travelers + add-ons
3. Proceed to checkout
4. Enter Stripe test card: `4242 4242 4242 4242`
5. Complete payment
6. Verify:
   - ✅ Booking confirmed
   - ✅ Email sent (check email logs)
   - ✅ Notification created (check bell icon)
   - ✅ Wallet updated if used

### 3. Test Booking Cancellation
1. Go to My Bookings
2. Click "Cancel Booking"
3. Enter cancellation reason
4. Verify:
   - ✅ Refund processed
   - ✅ Email sent
   - ✅ Status updated to cancelled

### 4. Setup Scheduled Jobs (Cron)

**Option A: Using Supabase Cron (Recommended)**
Create a scheduled function trigger in Supabase dashboard:
- Function: `scheduled-jobs`
- Cron: `0 */6 * * *` (Every 6 hours)

**Option B: External Service (e.g., GitHub Actions)**
```yaml
name: Scheduled Jobs
on:
  schedule:
    - cron: '0 */6 * * *'
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: Call scheduled jobs
        run: |
          curl -X POST https://your-supabase.com/functions/v1/scheduled-jobs \
            -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Post-Deployment Verification

### Email System
- [ ] Test booking confirmation email
- [ ] Test cancellation email
- [ ] Verify email templates are branded
- [ ] Check email logs table for errors

### Payment System
- [ ] Test Stripe payment flow
- [ ] Verify refund processing
- [ ] Check webhook logs
- [ ] Test wallet integration

### Notifications
- [ ] Notifications appear in real-time
- [ ] Mark as read works
- [ ] Notification bell shows unread count
- [ ] Real-time updates work

### Referral System
- [ ] User can see referral code
- [ ] Shared referral link works
- [ ] Reward triggers on booking
- [ ] Wallet updates correctly
- [ ] Email sent to referrer

---

## 📊 Monitoring Dashboard

### Check Email Logs
```sql
SELECT * FROM email_logs 
ORDER BY sent_at DESC 
LIMIT 20;
```

### Check Notifications
```sql
SELECT * FROM notifications 
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC;
```

### Check Referrals
```sql
SELECT * FROM referrals 
WHERE referrer_id = 'USER_ID'
OR referred_id = 'USER_ID';
```

### Check Cancellations
```sql
SELECT * FROM cancellations 
ORDER BY created_at DESC;
```

---

## 🐛 Common Issues & Fixes

### Emails Not Sending
```
Check: RESEND_API_KEY is set
Action: 
  1. Verify key in Supabase env variables
  2. Check email_logs table for errors
  3. Ensure from email is verified in Resend
```

### Notifications Not Appearing
```
Check: Real-time permissions
Action:
  1. Ensure RLS policies are set correctly
  2. Check browser notifications permissions
  3. Verify subscription is active in console
```

### Refunds Failing
```
Check: Stripe keys and charge ID
Action:
  1. Verify STRIPE_SECRET_KEY is correct
  2. Ensure charge ID is valid
  3. Check Stripe dashboard for errors
```

### Scheduled Jobs Not Running
```
Check: Cron job configuration
Action:
  1. Verify schedule is set in Supabase/external service
  2. Check function logs
  3. Test function manually via API call
```

---

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_GUIDE.md` | Complete feature documentation |
| `src/services/bookingService.ts` | All API service functions |
| `src/hooks/use-services.ts` | React hooks for services |
| `src/types/services.ts` | TypeScript type definitions |
| `src/components/NotificationCenter.tsx` | UI component |
| `src/components/MyBookingsEnhanced.tsx` | Enhanced My Bookings page |
| `supabase/migrations/20260706000000_*` | Database schema |

---

## 🎓 Testing Scenarios

### Scenario 1: Complete Booking Journey
1. Sign up
2. Browse packages
3. Select package with add-ons
4. Apply wallet credit
5. Proceed to payment
6. Complete payment
7. **Expected**: Confirmation email, notification, booking created

### Scenario 2: Share Referral & Earn
1. User A: Copy referral code from profile
2. User A: Share with User B
3. User B: Sign up with referral code
4. User B: Book a package
5. **Expected**: User A gets wallet credit, reward email, notification

### Scenario 3: Cancel Booking & Get Refund
1. User: Go to My Bookings
2. User: Click Cancel on confirmed booking
3. User: Enter reason
4. System: Processes 90% refund
5. **Expected**: Cancellation email, status updated, refund in 5-7 days

### Scenario 4: Trip Reminders
1. User has booking departing in 48 hours
2. Scheduled job runs every 6 hours
3. **Expected**: Pre-trip reminder email with details

### Scenario 5: Review Reminder
1. User completes trip (departure date passed)
2. Scheduled job detects completed trip
3. **Expected**: Review reminder email with reward incentive

---

## 💡 Tips for Success

### Best Practices
1. ✅ Always test in staging first
2. ✅ Monitor email logs for failures
3. ✅ Set up error alerts/monitoring
4. ✅ Regular database backups
5. ✅ Test cron jobs daily initially

### Performance Optimization
1. Use connection pooling for Supabase
2. Cache subscription tiers
3. Debounce notification creation
4. Batch email sending for bulk operations

### Security
1. Never log sensitive data
2. Validate all inputs
3. Use RLS policies
4. Rotate API keys regularly
5. Monitor for abuse

---

## 🚨 Emergency Contacts

For production issues:
- Resend Support: support@resend.com
- Stripe Support: https://dashboard.stripe.com
- Supabase Support: support@supabase.com

---

## Next Steps

1. Deploy to production ✅
2. Monitor for 24-48 hours
3. Gather user feedback
4. Fine-tune email templates
5. Setup analytics dashboard

**Estimated Time to Production:** 1-2 hours

---

Generated: July 6, 2025
**Status: READY FOR DEPLOYMENT** 🚀
