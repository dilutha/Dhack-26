# Environment Setup

This project requires Supabase configuration to function properly. Follow these steps to set up your environment:

## 1. Create Environment File

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Maintenance Mode Configuration (Optional)
NEXT_PUBLIC_MAINTENANCE_MODE=false
MAINTENANCE_BYPASS_CODES=dhack2025,admin123,backup456
MAINTENANCE_BYPASS_TOKEN=secure-random-token-here
ADMIN_TOKEN=dhack-admin-2025

# Google reCAPTCHA v2 (Invisible) keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Gmail SMTP Configuration (for email functionality)
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

## 2. Set Up Gmail SMTP (for Email Functionality)

The application uses Gmail SMTP for sending emails (registration confirmations, submission notifications, etc.). Follow these steps to configure Gmail:

### Generate Gmail App Password:

1. **Enable 2-Factor Authentication (2FA)** on your Gmail account:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security > 2-Step Verification
   - Follow the steps to enable 2FA

2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security > 2-Step Verification > App passwords
   - Select "Mail" as the app and "Other (custom name)" as the device
   - Enter "DHack Email System" as the custom name
   - Click "Generate"
   - Copy the 16-character password (ignore spaces)

3. **Configure Environment Variables**:
   - Replace `GMAIL_USER` with your Gmail address
   - Replace `GMAIL_APP_PASSWORD` with the 16-character app password

**Important Security Notes:**

- Never use your regular Gmail password
- The app password is specific to this application
- You can revoke app passwords anytime from your Google Account settings
- Keep your `.env.local` file secure and never commit it to version control

## 3. Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings > API
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## 4. Database Setup

Make sure your Supabase database has the required tables and functions:

- `usj_bis_students` table
- `get_usj_bis_students` RPC function

The migration files in `supabase/migrations/` should be applied to your database.

## 5. Maintenance Mode Setup (Optional)

The application includes a comprehensive maintenance mode system:

### Environment Variables:

- `NEXT_PUBLIC_MAINTENANCE_MODE`: Set to `true` to enable maintenance mode
- `MAINTENANCE_BYPASS_CODES`: Comma-separated list of bypass codes
- `MAINTENANCE_BYPASS_TOKEN`: Secure token for URL-based bypass
- `ADMIN_TOKEN`: Token for admin API access

### Features:

- Automatic redirection to maintenance page when enabled
- Secure bypass system with multiple codes
- Admin API for enabling/disabling maintenance mode
- Cookie-based bypass persistence (24 hours)
- URL token bypass for direct links

### Usage:

1. Set `NEXT_PUBLIC_MAINTENANCE_MODE=true` to enable maintenance mode
2. Use bypass codes from `MAINTENANCE_BYPASS_CODES` to access the site
3. Access admin controls via `/api/admin/maintenance` with `ADMIN_TOKEN`

## 6. Restart Development Server

After setting up the environment variables, restart your development server:

```bash
npm run dev
```

## Troubleshooting

If you see "Database not configured" errors, make sure:

1. The `.env.local` file exists in the root directory
2. All required environment variables are set
3. The Supabase project is active and accessible
4. The database tables and functions are properly set up
