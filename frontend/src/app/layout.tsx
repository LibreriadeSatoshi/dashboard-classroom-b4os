import type { Metadata } from "next";
import { Cinzel, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

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
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/web-app-manifest-192x192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cinzel.variable} ${inter.variable} ${geistMono.variable} antialiased`}
      >
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
