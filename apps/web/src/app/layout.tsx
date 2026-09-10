import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Athachi Farms FMS",
  description: "Farm management system for Athachi Farms",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1b4332",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
