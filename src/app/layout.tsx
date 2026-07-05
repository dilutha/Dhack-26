import type { Metadata } from 'next';
import { Inter, Orbitron, Roboto_Mono, Exo_2 } from 'next/font/google';
import './globals.css';
import InitialLoader from '@/components/InitialLoader';
import ThemeProvider from '@/components/ThemeProvider';
import StructuredData from '@/components/StructuredData';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orbitron',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

const exo2 = Exo_2({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-exo2',
});

export const metadata: Metadata = {
  title: "DHACK'26 - Sri Lanka AI Innovation Hackathon",
  description:
    "Join DHACK'26, Sri Lanka's AI-inspired innovation hackathon for university teams, school students, and the FMSC-exclusive ReBrand challenge.",
  keywords: [
    'DHACK 2026',
    'Sri Lanka Hackathon',
    'Inter University Hackathon',
    'Inter School Hackathon',
    'School Innovation Competition',
    'ReBrand Hackathon',
    'Artificial Intelligence',
    'UI UX Competition',
    'Innovation Challenge',
    'Sri Lanka',
    'University of Sri Jayewardenepura',
  ],
  authors: [{ name: "DHACK'26 Team" }],
  creator: "DHACK'26",
  publisher: 'University of Sri Jayewardenepura',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://dhack.lk'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/favicon.ico' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "DHACK'26 - Sri Lanka AI Innovation Hackathon",
    description:
      "Compete across Inter-University, InterSchool, and ReBrand hackathon tracks with AI, sustainability, and human-centered design at the core.",
    url: 'https://dhack.lk',
    siteName: "DHACK'26",
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 900,
        height: 900,
        alt: "DHACK'26 - Sri Lanka AI Innovation Hackathon",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "DHACK'26 - Sri Lanka AI Innovation Hackathon",
    description:
      'Three hackathon tracks. AI-inspired solutions. Real-world impact for Sri Lanka.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  category: 'Education',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className='scroll-smooth overflow-x-hidden'
      suppressHydrationWarning={true}
    >
      <head>
        <meta name='theme-color' content='#0F101E' />
        <meta name='msapplication-TileColor' content='#0F101E' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content="DHACK'26" />
        <link rel='apple-touch-icon' href='/favicon.ico' />
        <link rel='canonical' href='https://dhack.lk' />
        <script
          async
          src='https://cdn.counter.dev/script.js'
          data-id='62da214b-a11e-47ec-ae43-ded4db03e7ac'
          data-utcoffset='6'
        ></script>
        <StructuredData />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${exo2.variable} ${orbitron.variable} ${robotoMono.variable} ${inter.variable} font-sans antialiased overflow-x-hidden max-w-full`}
      >
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
          <InitialLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
