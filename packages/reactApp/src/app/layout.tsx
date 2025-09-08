import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers"; // 导入 Providers

export const metadata: Metadata = {
  title: "Decentralized Guestbook",
  description: "A guestbook on the blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers> {/* 在这里包裹 children */}
      </body>
    </html>
  );
}