import type { Metadata } from "next";
import { Cinzel, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import ClientSessionProvider from "@/components/SessionProvider";
import { NamePreferenceProvider } from "@/contexts/NamePreferenceContext";

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
  title: "B4OS Dashboard - GitHub Classroom Grades",
  description: "Dashboard para visualizar calificaciones de GitHub Classroom",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: 'https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: 'https://res.cloudinary.com/dkuwkpihs/image/upload/v1758759628/web-app-manifest-192x192_dkecn9.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cinzel.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        <ClientSessionProvider>
          <NamePreferenceProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </NamePreferenceProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
