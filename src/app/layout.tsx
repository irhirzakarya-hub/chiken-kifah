import type { Metadata, Viewport } from "next";
import { Cairo, Outfit } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://chicken-kifah.vercel.app"),
  title: "Chicken Kifah | مطعم شيكن كيفاه - برغر · شاورما · بيتزا",
  description:
    "مطعم شيكن كيفاه - أشهى الوجبات السريعة من برغر وشاورما وبيتزا بأعلى جودة وأفضل الأسعار في المغرب",
  keywords: [
    "Chicken Kifah",
    "شيكن كيفاه",
    "مطعم",
    "برغر",
    "شاورما",
    "بيتزا",
    "وجبات سريعة",
    "المغرب",
    "restaurant maroc",
    "burger",
    "pizza",
  ],
  authors: [{ name: "Chicken Kifah Restaurant" }],
  openGraph: {
    title: "Chicken Kifah | مطعم شيكن كيفاه",
    description: "أشهى الوجبات السريعة - برغر، شاورما، بيتزا",
    type: "website",
    locale: "ar_MA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
