import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAVINE — The Path to Light",
  description:
    "A human-centered space for meaningful creativity, culture, knowledge, and discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
