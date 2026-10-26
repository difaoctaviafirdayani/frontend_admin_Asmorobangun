import { ReactNode } from "react";
import AdminShell from "@/components/AdminShell";
import { getCurrentUser } from "@/lib/dal";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Pengecekan sebenarnya: belum login / bukan admin => redirect ke /login dari server.
  const admin = await getCurrentUser();

  return <AdminShell admin={admin}>{children}</AdminShell>;
}