## Supabase Setup

Set environment variables (create `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Maintenance Mode Configuration (Optional)
NEXT_PUBLIC_MAINTENANCE_MODE=false
MAINTENANCE_BYPASS_CODES=dhack2025,admin123,backup456
MAINTENANCE_BYPASS_TOKEN=secure-random-token-here
ADMIN_TOKEN=dhack-admin-2025

# Google reCAPTCHA v2 (Invisible) keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

Run schema in Supabase SQL Editor:

```
-- File: supabase/schema.sql
```

## 🚧 Maintenance Mode

The application includes a comprehensive maintenance mode system for when you need to take the site offline for updates or maintenance.

### Features:

- **Automatic Redirection**: All traffic is automatically redirected to a maintenance page
- **Secure Bypass System**: Multiple bypass codes and tokens for authorized access
- **Admin Controls**: API endpoints for enabling/disabling maintenance mode
- **Cookie-based Persistence**: Bypass access persists for 24 hours
- **Management Scripts**: Easy-to-use scripts for maintenance mode control

### Quick Start:

```bash
# Enable maintenance mode
./maintenance.sh enable

# Check status
./maintenance.sh status

# Disable maintenance mode
./maintenance.sh disable

# Test the system
./test-maintenance.sh
```

### Environment Variables:

- `NEXT_PUBLIC_MAINTENANCE_MODE`: Set to `true` to enable maintenance mode
- `MAINTENANCE_BYPASS_CODES`: Comma-separated list of bypass codes
- `MAINTENANCE_BYPASS_TOKEN`: Secure token for URL-based bypass
- `ADMIN_TOKEN`: Token for admin API access

### API Endpoints:

- `POST /api/maintenance-bypass` - Verify bypass code
- `GET /api/admin/maintenance` - Get maintenance status (admin only)
- `POST /api/admin/maintenance` - Enable/disable maintenance mode (admin only)

For detailed setup instructions, see `docs/ENVIRONMENT_SETUP.md`.

Additional docs:

- Design system: `docs/colour.md`
- Admin dashboard prompt: `docs/ADMIN_DASHBOARD_PROMPT.md`

# DHACK'26 - Project Documentation

## 📁 Project Structure

```
/Users/harshadeshappriya/Desktop/fuc/
├── src/
│   ├── app/
│   │   ├── api/submit/          # API route for form submissions
│   │   ├── globals.css          # Global styles and TailwindCSS
│   │   ├── layout.tsx           # Root layout with metadata
│   │   └── page.tsx             # Main page component
│   ├── components/
│   │   ├── ui/                  # Reusable UI components (Shadcn/ui)
│   │   ├── About.tsx            # About section with SDG values
│   │   ├── Contact.tsx          # Contact information
│   │   ├── FAQ.tsx              # Frequently asked questions
│   │   ├── Footer.tsx           # Site footer
│   │   ├── Gallery.tsx          # Event gallery
│   │   ├── Hero.tsx             # Hero section with 3D background
│   │   ├── Navbar.tsx           # Navigation component
│   │   ├── Prizes.tsx           # Prize information
│   │   ├── SubmissionForm.tsx   # Project submission form
│   │   ├── Timeline.tsx         # Event timeline
│   │   ├── Workshops.tsx        # Workshop information
│   │   ├── StructuredData.tsx   # JSON-LD structured data
│   │   ├── ThemeProvider.tsx    # Theme provider for dark/light mode
│   │   └── PerformanceProvider.tsx # Performance monitoring
│   ├── hooks/
│   │   ├── useIntersectionObserver.ts # Intersection observer hook
│   │   └── usePerformance.ts          # Performance monitoring hook
│   ├── lib/
│   │   ├── constants.ts         # Application constants
│   │   ├── utils.ts             # Utility functions
│   │   └── three-utils.ts       # Three.js utilities
│   └── types/
│       └── json.d.ts            # TypeScript declarations
├── public/
│   ├── favicon.ico              # Favicon
│   ├── favicon.svg              # SVG favicon
│   ├── og-image.svg             # Open Graph image
│   ├── robots.txt               # Search engine crawling rules
│   ├── sitemap.xml              # Site structure for search engines
│   ├── manifest.json            # PWA manifest
│   ├── assests/                 # Static assets
│   ├── loading.json             # Lottie animation file
│   └── places/                  # Place images
├── node_modules/                # Dependencies
├── tailwind.config.ts          # TailwindCSS configuration
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies and scripts
```

## 📦 Libraries to Install

### Core Dependencies

```bash
npm install next@^14.2.32 react@^18.3.1 react-dom@^18.3.1 typescript@^5.3.3
```

### Styling & UI

```bash
npm install tailwindcss@^3.4.8 postcss@^8.4.40 autoprefixer@^10.4.20
npm install @radix-ui/react-accordion@^1.2.0 @radix-ui/react-dialog@^1.1.1
npm install @radix-ui/react-select@^2.1.1 @radix-ui/react-slot@^1.1.0
npm install @radix-ui/react-toast@^1.2.1 class-variance-authority@^0.7.0
npm install clsx@^2.1.1 tailwind-merge@^2.4.0 tailwindcss-animate@^1.0.7
```

### Animations & 3D

```bash
npm install framer-motion@^11.3.19 @react-three/fiber@^8.16.8
npm install @react-three/drei@^9.108.3 three@^0.166.1 maath@^0.10.8 ogl@^1.0.11
```

### Forms & Validation

```bash
npm install react-hook-form@^7.52.2 @hookform/resolvers@^3.9.0 zod@^3.23.8
```

### Fonts & Icons

```bash
npm install lucide-react@^0.424.0
npm install @next/font@^14.2.32
```

### Development Dependencies

```bash
npm install --save-dev @types/node@^20.19.11 @types/react@^18.3.3
npm install --save-dev @types/react-dom@^18.3.0 @types/three@^0.166.0
npm install --save-dev eslint@^8.57.0 eslint-config-next@^14.2.5
```

## � Production Deployment

### Prerequisites

1. **Environment Variables**: Ensure all required environment variables are set in `.env.local` (admin dashboard has been removed from this codebase):

   ```env
   # Required for production
   GOOGLE_SCRIPT_URL=your_google_apps_script_web_app_url
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   NEXT_PUBLIC_APP_URL=https://dhack25.vercel.app

   # Optional but recommended
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_search_console_verification_code
   ```

2. **Google Services Setup**:
   - Create a Google Apps Script for form submissions
   - Set up reCAPTCHA v2 at `https://www.google.com/recaptcha/admin`
   - Configure Google Search Console verification

### Deployment Steps

1. **Run the deployment script**:

   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Test the production build locally** (optional):

   ```bash
   ./deploy.sh --test
   ```

3. **Deploy to your hosting platform**:
   - **Vercel**: `vercel --prod`
   - **Netlify**: `netlify deploy --prod`
   - **Docker**: `docker build -t dhack25 . && docker run -p 3000:3000 dhack25`

### Performance Optimizations Applied

- ✅ **Code Splitting**: Heavy components (Hero, Gallery) are lazy-loaded
- ✅ **Image Optimization**: Next.js Image component with responsive sizes
- ✅ **Security Headers**: CSP, XSS protection, frame options
- ✅ **Rate Limiting**: API endpoints protected against abuse
- ✅ **Memory Management**: GSAP animations properly cleaned up
- ✅ **Loading States**: Skeleton components for better UX
- ✅ **Error Tracking**: Built-in error logging and monitoring
- ✅ **Accessibility**: ARIA labels, keyboard navigation, skip links

### Security Features

- 🔒 **Content Security Policy**: Strict CSP headers
- 🔒 **Rate Limiting**: 5 requests per 15 minutes per IP
- 🔒 **Input Validation**: Zod schemas for all form inputs

- 🔒 **Environment Variables**: Sensitive data in environment variables
- 🔒 **HTTPS Only**: Secure headers and redirects

### Monitoring & Analytics

The application includes built-in monitoring for:

- Performance metrics (Core Web Vitals)
- Error tracking and logging
- Memory usage monitoring (development)
- API response times

All monitoring data is logged to the console - integrate with your preferred monitoring service.

## �🔧 Environment Variables (.env.local)

Create a `.env.local` file in the root directory:

````env
# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://dhack25.vercel.app

# Google Search Console (replace with actual verification code)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=search console verification code



# Optional: Analytics (if using any)
# NEXT_PUBLIC_GA_TRACKING_ID=your-ga-tracking-id

# Optional: API Keys (if needed)
# NEXT_PUBLIC_API_BASE_URL=https://api.example.com

# Optional: Email Service (for contact forms)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASS=your-password

replace the search console verification code. src>app>layout.tsx>


## 🎨 Design System & Style Guide

### Typography

#### Fonts

- **Primary Font**: Exo 2 (Google Fonts)
  - Weights: 400, 500, 600, 700, 800, 900
  - Variable: `--font-exo2`
- **Secondary Font**: Orbitron (Google Fonts)
  - Weights: 400, 500, 600, 700, 800, 900
  - Variable: `--font-orbitron`
- **Monospace Font**: Roboto Mono (Google Fonts)
  - Weights: 400, 500, 600, 700
  - Variable: `--font-roboto-mono`
- **Fallback Font**: Inter (Google Fonts)
  - Weights: 400, 500, 600, 700
  - Variable: `--font-inter`

#### Font Classes

```css
/* Heading styles */
.font-heading {
  font-family: var(--font-exo2);
}

/* Display styles */
.font-display {
  font-family: var(--font-orbitron);
}

/* Code styles */
.font-mono {
  font-family: var(--font-roboto-mono);
}
````

### Color Palette

#### Primary Colors

```css
/* Dark Theme Background */
--dhack-base: #0f101e;
--dhack-base-secondary: #1a1b2e;

/* Brand Colors */
--dhack-orange: #ff6b35;
--dhack-teal: #00d9ff;

/* Semantic Colors */
--foreground: #ffffff;
--muted-foreground: #a1a1aa;
--card: rgba(255, 255, 255, 0.05);
--border: rgba(255, 255, 255, 0.1);
```

#### Gradient Definitions

```css
/* Primary gradient */
--gradient-primary: linear-gradient(135deg, #ff6b35 0%, #00d9ff 100%);

/* Secondary gradient */
--gradient-secondary: linear-gradient(135deg, #0f101e 0%, #1a1b2e 100%);
```

### Spacing Scale

#### Spacing Tokens

```css
/* Spacing scale (in rem) */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
--space-20: 5rem; /* 80px */
--space-24: 6rem; /* 96px */
--space-32: 8rem; /* 128px */
```

### Component Styles

#### Button Variants

```css
/* Primary button */
.btn-primary {
  @apply bg-gradient-to-r from-dhack-orange to-dhack-teal text-white font-medium px-6 py-3 rounded-lg;
  @apply hover:shadow-lg transition-all duration-300 transform hover:scale-105;
}

/* Secondary button */
.btn-secondary {
  @apply border border-dhack-teal text-dhack-teal bg-transparent font-medium px-6 py-3 rounded-lg;
  @apply hover:bg-dhack-teal hover:text-white transition-all duration-300;
}
```

#### Utility Classes

```css
/* Glow effect */
.glow {
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #ff6b35 0%, #00d9ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Hover card effect */
.hover-card {
  @apply transition-all duration-300 hover:scale-105 hover:shadow-xl;
}
```

### Breakpoints

#### Responsive Design

```css
/* Mobile First */
@media (min-width: 640px) {
  /* sm: */
}
@media (min-width: 768px) {
  /* md: */
}
@media (min-width: 1024px) {
  /* lg: */
}
@media (min-width: 1280px) {
  /* xl: */
}
@media (min-width: 1536px) {
  /* 2xl: */
}
```

### Technologies Used

#### Frontend Framework

- **Next.js 14+** - React framework with App Router
- **React 18+** - UI library
- **TypeScript** - Type-safe JavaScript

#### Styling & Design

- **TailwindCSS** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Google Fonts** - Web fonts (Exo 2, Orbitron, Roboto Mono, Inter)

#### Animations & Interactions

- **Framer Motion** - Animation library
- **React Three Fiber** - 3D graphics in React
- **Three.js** - 3D graphics library

#### UI Components

- **Shadcn/ui** - Component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Icon library

#### Forms & Validation

- **React Hook Form** - Form management
- **Zod** - Schema validation

#### Development Tools

- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Prettier** - Code formatting

#### Performance & SEO

- **Next.js Image** - Optimized images
- **Dynamic Imports** - Code splitting
- **Structured Data** - JSON-LD for SEO
- **PWA Manifest** - Progressive Web App support
