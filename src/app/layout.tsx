import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import "@fontsource-variable/figtree";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { AppShell } from "@/components/layout/AppShell";
import { StreamDefs } from "@/components/stream/StreamDefs";

export const metadata: Metadata = {
  title: "AI Diary",
  description:
    "A private journal where every entry is a firefly on a stream at night, with an AI companion that notices how your days feel.",
};

export const viewport: Viewport = {
  themeColor: "#120f14",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen">
        <StreamDefs />
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
