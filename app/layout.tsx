import type { Metadata } from "next";
import { ReactNode } from "react";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

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
    <html lang="id">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}