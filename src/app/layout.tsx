import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JKK Silks - Luxury Saree E-Commerce",
  description: "Experience the timeless elegance of authentic Kanjivaram and Banarasi silk sarees.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${outfit.className} min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]`}>
        {children}
      </body>
    </html>
  );
}
