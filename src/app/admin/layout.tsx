import { Metadata } from 'next';
import AdminGuard from '../../components/admin/AdminGuard';

// Ensure admin area has clear contrast in both themes
// Wrap children with a container that sets a consistent background and text color

export const metadata: Metadata = {
  title: 'Admin Dashboard - D-Hack',
  description: 'Admin panel for D-Hack hackathon management',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  other: {
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className='min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100'>
        {children}
      </div>
    </AdminGuard>
  );
}
