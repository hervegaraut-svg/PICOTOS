import type { Metadata } from "next";
import { Lato, Playfair_Display } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "Picotos and Co",
  description: "Espace familial privé Picotos and Co",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${playfair.variable} ${lato.variable} bg-cream text-brown antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
