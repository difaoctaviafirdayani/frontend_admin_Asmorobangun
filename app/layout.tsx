import type { Metadata } from "next";
import { ReactNode } from "react";
import { Poppins, Margarine } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const margarine = Margarine({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-margarine",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Asmorobangun Admin",
  description: "Dashboard admin Sanggar Wayang Topeng Malangan Asmorobangun",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id" className={`${poppins.variable} ${margarine.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}