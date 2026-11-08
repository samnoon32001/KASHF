import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kashf Institute of Islamic Excellence',
  description:
    'A modern, responsive LMS & institutional management progressive web application for Kashf Institute of Islamic Excellence featuring RBAC, live Google Meet classes, attendance tracking, creative task workflows, telecaller CRM, and student portal.',
  applicationName: 'Kashf',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kashf',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Kashf Institute of Islamic Excellence',
    description:
      'A modern, responsive LMS & institutional management progressive web application for Kashf Institute of Islamic Excellence featuring RBAC, live Google Meet classes, attendance tracking, creative task workflows, telecaller CRM, and student portal.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  themeColor: '#117B78',
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFA] text-[#1E293B] antialiased selection:bg-[#117B78]/20 selection:text-[#117B78]">
        {children}
      </body>
    </html>
  );
}
