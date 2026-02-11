import React from "react"
import type { Metadata, Viewport } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Savannah Palace Hotel | Your Home Away from Home",
  description:
    "Savannah Palace Hotel - Premium Kenyan hospitality with local and intercontinental cuisine, luxury rooms, and exceptional service in Nairobi.",
};

export const viewport: Viewport = {
  themeColor: "#C49A2B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${openSans.variable} font-sans antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
