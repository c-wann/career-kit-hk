import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Kit HK",
  description: "CV / SOP 工具包",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
