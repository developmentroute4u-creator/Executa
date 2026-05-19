import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Executa — Governed Execution Platform",
    template: "%s | Executa",
  },
  description:
    "A governed execution platform that defines work, evaluates freelancer capability, calculates structured pricing, and enforces outcomes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-background text-text-primary min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
