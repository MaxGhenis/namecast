import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Namecast - AI-powered brand name oracle",
  description:
    "Forecast your brand name's future with AI. Check domain availability, social handles, trademark risk, pronunciation, and brand-mission alignment in one unified scorecard.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
