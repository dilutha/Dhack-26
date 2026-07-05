# Production Deployment Guide

## Environment Variables Required

### Database Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Authentication & Security

```bash
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
CSRF_SECRET=your_csrf_secret_key_here_minimum_32_characters
```

### reCAPTCHA Configuration

```bash
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

### Email Configuration

```bash
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@dhack25.vercel.app
```

### Admin Configuration

```bash
ADMIN_TOKEN=your_admin_token_here_for_legacy_support
```

### Maintenance Mode

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=false
MAINTENANCE_BYPASS_TOKEN=your_maintenance_bypass_token_here
MAINTENANCE_BYPASS_CODES=bypass1,bypass2,bypass3
MAINTENANCE_BYPASS_HASHES=hashed_bypass1,hashed_bypass2,hashed_bypass3
```

### Google Site Verification

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_google_verification_code_here
```

### Development/Production Flags

```bash
NODE_ENV=production
NEXT_PUBLIC_ENABLE_LOGGING=false
```

## Security Checklist

- [ ] All environment variables are set
- [ ] JWT_SECRET is at least 32 characters long
- [ ] CSRF_SECRET is at least 32 characters long
- [ ] reCAPTCHA is properly configured
- [ ] Admin passwords are strong
- [ ] Database credentials are secure
- [ ] HTTPS is enabled
- [ ] Security headers are working
- [ ] Rate limiting is active
- [ ] CORS is properly configured

## Performance Checklist

- [ ] Database connection pooling is enabled
- [ ] Caching is working
- [ ] Images are optimized
- [ ] Bundle size is minimized
- [ ] CDN is configured
- [ ] Compression is enabled

## Testing Checklist

- [ ] All tests pass
- [ ] API endpoints are tested
- [ ] Forms work correctly
- [ ] Authentication works
- [ ] Error handling works
- [ ] Mobile responsiveness is tested
- [ ] Accessibility is tested

## Monitoring Setup

- [ ] Error tracking (Sentry, LogRocket)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Security monitoring
- [ ] Database monitoring

## Deployment Steps

1. Set all environment variables
2. Run `npm run build`
3. Run `npm run test:ci`
4. Deploy to production
5. Verify all functionality
6. Monitor for errors
7. Set up monitoring

## Post-Deployment

1. Test all critical paths
2. Verify security headers
3. Check performance metrics
4. Monitor error logs
5. Test admin functionality
6. Verify email sending
7. Test form submissions
