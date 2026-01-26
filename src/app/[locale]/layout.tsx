import type { Metadata } from "next";
import { Cinzel, Inter, Geist_Mono } from "next/font/google";
import "../globals.css";
import Footer from "@/components/Footer";
import ClientSessionProvider from "@/components/SessionProvider";
import { NamePreferenceProvider } from "@/contexts/NamePreferenceContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

// Epic font for LOTR titles
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Technical font for Bitcoin/Dev content
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B4OS Dashboard - Reino del Código Abierto",
  description: "Dashboard Programa Bitcoin 4 Open Source",
  icons: {
    icon: [
      { url: 'https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png', sizes: '32x32', type: 'image/png' },
      { url: 'https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png', sizes: '16x16', type: 'image/png' },
      { url: 'https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: 'https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png',
    apple: 'https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png',
  },
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${cinzel.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ClientSessionProvider>
            <NamePreferenceProvider>
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
            </NamePreferenceProvider>
          </ClientSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
