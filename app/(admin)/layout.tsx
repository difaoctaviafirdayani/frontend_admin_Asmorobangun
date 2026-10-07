import type { Metadata } from "next";
import { ReactNode } from "react";
import { Poppins, Itim } from "next/font/google";
import { ToastProvider } from "@/components/Toast";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-poppins" });
const itim = Itim({ subsets: ["latin"], weight: "400", variable: "--font-itim" });

export const metadata: Metadata = {
  title: "Asmorobangun Admin",
  description: "Dashboard admin Sanggar Wayang Topeng Malangan Asmorobangun",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className={`${poppins.variable} ${itim.variable}`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}