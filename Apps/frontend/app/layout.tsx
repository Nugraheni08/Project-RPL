import type { Metadata, Viewport } from 'next';
import { DM_Sans, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './global.css';

// Konfigurasi font menggunakan next/font/google sesuai index.html
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-playfair-display',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
});

// Metadata aplikasi pengganti tag <title> dan deskripsi awal
export const metadata: Metadata = {
  title: 'Wmap',
  description: 'Sustain the future',
};

// Konfigurasi viewport sesuai dengan pengaturan indeks asli
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Leaflet CSS untuk mendukung pemetaan di seluruh aplikasi */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${dmSans.variable} ${playfairDisplay.variable} ${plusJakartaSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}