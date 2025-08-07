CRUFTYs-Games

## Email Verification Setup

This application uses email verification for user authentication. To ensure verification codes are delivered to Gmail accounts, follow these setup steps:

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Service Configuration
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
```

### 2. Email Service Setup (Choose One)

#### Option A: Resend API (Recommended)
1. Sign up at [Resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add your domain and verify it
4. Set `RESEND_API_KEY` in your environment variables

#### Option B: Gmail SMTP (Alternative)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Set SMTP configuration in environment variables

### 3. Supabase Edge Function Deployment

The email sending functionality is handled by a Supabase Edge Function. Make sure to:

1. Deploy the `send-verification-email` function to your Supabase project
2. Set the environment variables in your Supabase dashboard
3. Test the function using the Supabase dashboard

### 4. Gmail Delivery Best Practices

To ensure emails reach Gmail inboxes:

- **Use a verified domain** for the FROM address
- **Set up SPF, DKIM, and DMARC** records for your domain
- **Use Resend or similar service** instead of direct SMTP for better deliverability
- **Monitor bounce rates** and maintain good sender reputation

### 5. Testing the Email System

1. Start the development server: `npm run dev`
2. Enter an authorized Gmail address
3. Check that the verification email arrives within 1-2 minutes
4. Verify the code works correctly
5. Monitor the browser console and Supabase logs for any errors

### Troubleshooting

If emails are not being delivered:

1. **Check Supabase Edge Function logs** for errors
2. **Verify environment variables** are set correctly
3. **Test with different Gmail accounts** to rule out account-specific issues
4. **Check spam folders** - initial emails may be filtered
5. **Verify domain authentication** if using custom domain

### Security Features

- Codes expire after 10 minutes
- Maximum 3 verification attempts per code
- Secure code generation using crypto-random numbers
- Rate limiting on email sending (implement as needed)
