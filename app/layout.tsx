import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Attendly',
  description: 'Smart attendance tracker for students',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}