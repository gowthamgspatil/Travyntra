// Email template generator for various booking scenarios

export interface BookingConfirmationData {
  userName: string;
  userEmail: string;
  bookingId: string;
  packageTitle: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  totalAmount: number;
  addons: string[];
  walletUsed: number;
  confirmationUrl: string;
  cancelUrl: string;
}

export interface PaymentReceiptData {
  userName: string;
  bookingId: string;
  packageTitle: string;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: string;
  invoiceUrl: string;
}

export interface CancellationData {
  userName: string;
  bookingId: string;
  packageTitle: string;
  refundAmount: number;
  refundDate: string;
  reason: string;
}

export interface ReminderData {
  userName: string;
  bookingId: string;
  packageTitle: string;
  departureDate: string;
  itineraryUrl: string;
  checkinTime: string;
  meetingPoint: string;
}

export interface ReviewReminderData {
  userName: string;
  packageTitle: string;
  reviewUrl: string;
}

// Booking Confirmation Email Template
export function generateBookingConfirmationEmail(data: BookingConfirmationData): string {
  return `
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
                <p>Hi <strong>${data.userName}</strong>,</p>
                <p>Thank you for booking with Travyntra! Your booking has been confirmed and payment has been processed successfully.</p>
                
                <div class="booking-details">
                    <h3 style="margin-top: 0;">Booking Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Booking ID:</span>
                        <span class="detail-value">${data.bookingId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Package:</span>
                        <span class="detail-value">${data.packageTitle}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Departure:</span>
                        <span class="detail-value">${new Date(data.departureDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Return:</span>
                        <span class="detail-value">${new Date(data.returnDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Travelers:</span>
                        <span class="detail-value">${data.travelers} person(s)</span>
                    </div>
                </div>
                
                ${data.addons && data.addons.length > 0 ? `
                <h4>Add-ons Selected:</h4>
                <ul class="addon-list">
                    ${data.addons.map(addon => `<li>• ${addon}</li>`).join('')}
                </ul>
                ` : ''}
                
                <div class="price-section">
                    <h4>Payment Summary</h4>
                    <div class="price-row">
                        <span>Package Price:</span>
                        <span>₹${data.totalAmount}</span>
                    </div>
                    ${data.walletUsed > 0 ? `
                    <div class="price-row">
                        <span>Wallet Used:</span>
                        <span>-₹${data.walletUsed}</span>
                    </div>
                    ` : ''}
                    <div class="total-row">
                        <span>Total Amount Paid:</span>
                        <span>₹${data.totalAmount - data.walletUsed}</span>
                    </div>
                </div>
                
                <p><strong>What's Next?</strong></p>
                <ul>
                    <li>Check your itinerary and prepare for your adventure</li>
                    <li>Review our pre-trip guidelines and packing list</li>
                    <li>Contact us if you have any questions</li>
                </ul>
                
                <a href="${data.confirmationUrl}" class="button">View Your Booking</a>
                
                <p style="margin-top: 30px; color: #666;">
                    Have questions? <a href="mailto:support@travyntra.com" style="color: #667eea;">Contact our support team</a> or reply to this email.
                </p>
            </div>
            
            <div class="footer">
                <p>&copy; 2025 Travyntra. All rights reserved.</p>
                <p><a href="${data.cancelUrl}">Manage Booking</a> | <a href="#">Cancellation Policy</a> | <a href="#">Contact Us</a></p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Payment Receipt Email Template
export function generatePaymentReceiptEmail(data: PaymentReceiptData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #2d3748; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 30px; }
            .receipt { background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .receipt-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #ddd; }
            .receipt-row:last-child { border-bottom: none; }
            .receipt-label { font-weight: bold; color: #555; }
            .receipt-value { color: #333; }
            .amount { font-size: 24px; font-weight: bold; color: #10b981; }
            .button { display: inline-block; background: #2d3748; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Payment Receipt</h1>
                <p>Transaction Confirmed</p>
            </div>
            
            <div class="content">
                <p>Hi ${data.userName},</p>
                <p>Thank you for your payment! Here's your receipt.</p>
                
                <div class="receipt">
                    <div class="receipt-row">
                        <span class="receipt-label">Booking ID:</span>
                        <span class="receipt-value">${data.bookingId}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Package:</span>
                        <span class="receipt-value">${data.packageTitle}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Payment Method:</span>
                        <span class="receipt-value">${data.paymentMethod}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="receipt-label">Date:</span>
                        <span class="receipt-value">${new Date(data.date).toLocaleDateString()}</span>
                    </div>
                    <div class="receipt-row" style="border-bottom: 2px solid #ddd; padding-top: 15px; margin-top: 15px;">
                        <span class="receipt-label">Amount Paid:</span>
                        <span class="amount">${data.currency} ${data.amount}</span>
                    </div>
                </div>
                
                <p style="margin-top: 30px;">Your receipt has been securely stored in your account.</p>
                
                <a href="${data.invoiceUrl}" class="button">Download Invoice</a>
                
                <p style="margin-top: 30px; color: #666;">
                    For any issues with your payment, please <a href="mailto:support@travyntra.com" style="color: #667eea;">contact support</a>.
                </p>
            </div>
            
            <div class="footer">
                <p>&copy; 2025 Travyntra. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Cancellation Email Template
export function generateCancellationEmail(data: CancellationData): string {
  return `
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
            .detail-row { display: flex; justify-content: space-between; margin: 12px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Booking Cancelled</h1>
                <p>Your request has been processed</p>
            </div>
            
            <div class="content">
                <p>Hi ${data.userName},</p>
                <p>Your booking has been successfully cancelled.</p>
                
                <div class="alert">
                    <strong>Cancellation Details</strong>
                    <div class="detail-row" style="margin-top: 12px;">
                        <span>Booking ID:</span>
                        <span>${data.bookingId}</span>
                    </div>
                    <div class="detail-row">
                        <span>Package:</span>
                        <span>${data.packageTitle}</span>
                    </div>
                    <div class="detail-row">
                        <span>Refund Amount:</span>
                        <span style="color: #10b981; font-weight: bold;">₹${data.refundAmount}</span>
                    </div>
                    <div class="detail-row">
                        <span>Refund Processing Date:</span>
                        <span>${new Date(data.refundDate).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <p><strong>Cancellation Reason:</strong> ${data.reason}</p>
                
                <p>Your refund will be processed within 5-7 business days to your original payment method.</p>
                
                <p style="margin-top: 30px;">We'd love to have you back! Feel free to book another adventure whenever you're ready.</p>
                
                <p style="margin-top: 30px; color: #666;">
                    If you have any concerns about this cancellation, please <a href="mailto:support@travyntra.com" style="color: #667eea;">contact our support team</a>.
                </p>
            </div>
            
            <div class="footer">
                <p>&copy; 2025 Travyntra. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Reminder Email Template
export function generateReminderEmail(data: ReminderData): string {
  return `
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
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Your Adventure Starts Soon!</h1>
                <p>Get ready for an amazing journey</p>
            </div>
            
            <div class="content">
                <p>Hi ${data.userName},</p>
                <p>We're excited to have you joining us! Your trip is just around the corner.</p>
                
                <div class="reminder-box">
                    <h3 style="margin-top: 0;">Important Details</h3>
                    <div class="detail-row">
                        <span><strong>Package:</strong></span>
                        <span>${data.packageTitle}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Departure Date:</strong></span>
                        <span>${new Date(data.departureDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Check-in Time:</strong></span>
                        <span>${data.checkinTime}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Meeting Point:</strong></span>
                        <span>${data.meetingPoint}</span>
                    </div>
                </div>
                
                <h3>Pre-Trip Checklist</h3>
                <ul>
                    <li>Confirm your travel documents and IDs</li>
                    <li>Check weather forecast and pack accordingly</li>
                    <li>Review our pre-trip guidelines</li>
                    <li>Arrive 15 minutes early at the meeting point</li>
                    <li>Bring a valid ID and booking confirmation</li>
                </ul>
                
                <a href="${data.itineraryUrl}" class="button">View Full Itinerary</a>
                
                <p style="margin-top: 30px; color: #666;">
                    Have questions? <a href="mailto:support@travyntra.com" style="color: #667eea;">Contact us</a>.
                </p>
            </div>
            
            <div class="footer">
                <p>&copy; 2025 Travyntra. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Review Reminder Email Template
export function generateReviewReminderEmail(data: ReviewReminderData): string {
  return `
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
            .stars { font-size: 24px; margin: 10px 0; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>How Was Your Experience?</h1>
                <p>Your feedback helps us improve</p>
            </div>
            
            <div class="content">
                <p>Hi ${data.userName},</p>
                <p>We hope you had an amazing time on your recent adventure with us! We'd love to hear about your experience.</p>
                
                <p>Your honest feedback helps us serve you better and helps other travelers make informed decisions.</p>
                
                <div class="stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
                
                <p><strong>Share your thoughts about:</strong></p>
                <ul>
                    <li>Overall experience and highlights</li>
                    <li>Accommodation and meals</li>
                    <li>Tour guide and staff</li>
                    <li>Value for money</li>
                </ul>
                
                <a href="${data.reviewUrl}" class="button">Write a Review</a>
                
                <p style="margin-top: 30px; color: #666;">
                    Thank you for choosing Travyntra! We can't wait to welcome you on your next adventure.
                </p>
            </div>
            
            <div class="footer">
                <p>&copy; 2025 Travyntra. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
