import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "SUVIDHA — Governance at the Speed of Light",
  description:
    "Pay bills, report issues, and manage your city life. Zero queues. Zero paperwork. Smart city governance made simple.",
  keywords: ["SUVIDHA", "smart city", "governance", "utility", "bills", "e-governance"],
  openGraph: {
    title: "SUVIDHA — Governance at the Speed of Light",
    description: "Pay bills, report issues, and manage your city life.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
