import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Caveat } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Executa",
    template: "%s | Executa",
  },
  description:
    "A governed execution platform that defines work, evaluates freelancer capability, calculates structured pricing, and enforces outcomes.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} ${caveat.variable}`}>
      <body className="font-sans antialiased bg-background text-text-primary min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
