import type { Metadata } from "next";
import { Azeret_Mono, Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const serif = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
});

const mono = Azeret_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-azeret",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ochre-storefront.vercel.app"),
  title: {
    default: "OCHRÉ",
    template: "%s",
  },
  description:
    "A quiet private gallery. Your image, made into an object. Numbered, with a certificate issued with the piece.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[var(--porcelain)] text-[var(--ink)]">{children}</body>
    </html>
  );
}
