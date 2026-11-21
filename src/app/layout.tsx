import type { Metadata } from "next";
import { PUBLIC_SITE } from "@/lib/public-site";
import { Azeret_Mono, Cinzel, Cormorant_Garamond, EB_Garamond } from "next/font/google";
import "./globals.css";

const sans = EB_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "optional",
  preload: false,
});

const serif = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["500"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "optional",
  preload: true,
});

const mark = Cinzel({
  subsets: ["latin", "latin-ext"],
  weight: ["500"],
  variable: "--font-cinzel",
  display: "optional",
  preload: true,
});

const mono = Azeret_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-azeret",
  display: "optional",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_SITE),
  title: {
    default: "OCHRÉ",
    template: "%s",
  },
  description:
    "Bring an image or an idea. OCHRÉ makes one physical object to order, numbered, with a certificate and a provenance passport.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mark.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--porcelain)] text-[var(--ink)]">{children}</body>
    </html>
  );
}
