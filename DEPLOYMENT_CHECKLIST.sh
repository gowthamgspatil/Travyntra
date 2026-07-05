#!/bin/bash

# DEPLOYMENT CHECKLIST - Run this before going to production
# Usage: bash ./DEPLOYMENT_CHECKLIST.sh

echo "🚀 Travyntra Booking Platform - Production Deployment Checklist"
echo "=============================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check status
check_status() {
    local item=$1
    local status=${2:-"❌ NOT VERIFIED"}
    
    if [[ $status == *"✅"* ]]; then
        echo -e "${GREEN}✅ $item${NC}"
    else
        echo -e "${RED}❌ $item${NC}"
    fi
}

# Section 1: Environment Variables
echo -e "${YELLOW}📋 SECTION 1: ENVIRONMENT VARIABLES${NC}"
echo "Verify these are set in Supabase dashboard -> Project Settings -> Environment Variables"
echo ""

read -p "Is RESEND_API_KEY set? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "RESEND_API_KEY" "✅ Verified" || check_status "RESEND_API_KEY" "❌ NOT SET"

read -p "Is STRIPE_SECRET_KEY set? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "STRIPE_SECRET_KEY" "✅ Verified" || check_status "STRIPE_SECRET_KEY" "❌ NOT SET"

read -p "Is STRIPE_WEBHOOK_SECRET set? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "STRIPE_WEBHOOK_SECRET" "✅ Verified" || check_status "STRIPE_WEBHOOK_SECRET" "❌ NOT SET"

read -p "Is APP_URL set? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "APP_URL" "✅ Verified" || check_status "APP_URL" "❌ NOT SET"

echo ""

# Section 2: Database
echo -e "${YELLOW}📊 SECTION 2: DATABASE MIGRATIONS${NC}"
echo "Run: supabase db push"
echo ""

read -p "Have all database migrations been applied? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Database migrations" "✅ Applied" || check_status "Database migrations" "❌ PENDING"

echo ""

# Section 3: Edge Functions
echo -e "${YELLOW}⚙️  SECTION 3: EDGE FUNCTIONS${NC}"
echo "Run: supabase functions deploy"
echo ""

echo "Functions to verify deployment:"
functions=("send-email" "send-booking-confirmation" "send-cancellation-email" "send-reminder-email" "send-review-reminder" "process-refund" "process-referral-reward" "create-notification" "scheduled-jobs")

for func in "${functions[@]}"; do
    read -p "Is $func deployed? (y/n) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]] && check_status "$func" "✅ Deployed" || check_status "$func" "❌ NOT DEPLOYED"
done

echo ""

# Section 4: Stripe Configuration
echo -e "${YELLOW}💳 SECTION 4: STRIPE CONFIGURATION${NC}"
echo ""

read -p "Is Stripe webhook configured to receive checkout.session.completed? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Stripe webhook" "✅ Configured" || check_status "Stripe webhook" "❌ NOT CONFIGURED"

read -p "Webhook URL set to: https://your-supabase.com/functions/v1/stripe-webhook (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Webhook URL" "✅ Correct" || check_status "Webhook URL" "❌ INCORRECT"

echo ""

# Section 5: Email Configuration
echo -e "${YELLOW}📧 SECTION 5: EMAIL CONFIGURATION${NC}"
echo ""

read -p "Is Resend API key valid and tested? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Resend API" "✅ Working" || check_status "Resend API" "❌ NOT WORKING"

read -p "Is sender email (noreply@travyntra.com) verified in Resend? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Sender email" "✅ Verified" || check_status "Sender email" "❌ NOT VERIFIED"

echo ""

# Section 6: Frontend Integration
echo -e "${YELLOW}🎨 SECTION 6: FRONTEND INTEGRATION${NC}"
echo ""

read -p "Is NotificationCenter imported in Navbar? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "NotificationCenter" "✅ Integrated" || check_status "NotificationCenter" "❌ NOT INTEGRATED"

read -p "Are service hooks imported in components? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Custom hooks" "✅ Integrated" || check_status "Custom hooks" "❌ NOT INTEGRATED"

echo ""

# Section 7: Testing
echo -e "${YELLOW}🧪 SECTION 7: TESTING${NC}"
echo ""

read -p "Has full booking flow been tested (booking → payment → confirmation)? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Booking flow test" "✅ PASSED" || check_status "Booking flow test" "❌ FAILED"

read -p "Has cancellation flow been tested? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Cancellation test" "✅ PASSED" || check_status "Cancellation test" "❌ FAILED"

read -p "Has email delivery been verified? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Email delivery test" "✅ PASSED" || check_status "Email delivery test" "❌ FAILED"

read -p "Has referral system been tested? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Referral test" "✅ PASSED" || check_status "Referral test" "❌ FAILED"

read -p "Have real-time notifications been verified? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Notifications test" "✅ PASSED" || check_status "Notifications test" "❌ FAILED"

echo ""

# Section 8: Monitoring
echo -e "${YELLOW}📊 SECTION 8: MONITORING SETUP${NC}"
echo ""

read -p "Are error logs being monitored? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Error monitoring" "✅ Configured" || check_status "Error monitoring" "❌ NOT CONFIGURED"

read -p "Is email_logs table being monitored? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Email logs monitoring" "✅ Configured" || check_status "Email logs monitoring" "❌ NOT CONFIGURED"

read -p "Are Stripe webhooks being monitored? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Webhook monitoring" "✅ Configured" || check_status "Webhook monitoring" "❌ NOT CONFIGURED"

echo ""

# Section 9: Security
echo -e "${YELLOW}🔒 SECTION 9: SECURITY CHECKS${NC}"
echo ""

read -p "Have RLS policies been verified on all tables? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "RLS policies" "✅ Verified" || check_status "RLS policies" "❌ NOT VERIFIED"

read -p "Are API keys rotated and secrets secured? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Secrets security" "✅ Secured" || check_status "Secrets security" "❌ NOT SECURED"

echo ""

# Section 10: Scheduled Jobs
echo -e "${YELLOW}⏰ SECTION 10: SCHEDULED JOBS${NC}"
echo ""

read -p "Is scheduled-jobs function configured in cron? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Scheduled jobs" "✅ Configured" || check_status "Scheduled jobs" "❌ NOT CONFIGURED"

read -p "Cron schedule set to: 0 */6 * * * (Every 6 hours)? (y/n) " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] && check_status "Cron schedule" "✅ Correct" || check_status "Cron schedule" "❌ INCORRECT"

echo ""

# Final Summary
echo -e "${YELLOW}✅ DEPLOYMENT CHECKLIST COMPLETE${NC}"
echo ""
echo "Next Steps:"
echo "1. Review any ❌ items above"
echo "2. Fix any failed items"
echo "3. Re-run this checklist"
echo "4. Deploy to production when all items are ✅"
echo ""
echo "For help, see:"
echo "  - QUICK_START.md"
echo "  - IMPLEMENTATION_GUIDE.md"
echo "  - IMPLEMENTATION_SUMMARY.md"
echo ""
