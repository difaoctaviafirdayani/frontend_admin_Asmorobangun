import AdminShell from "@/components/AdminShell";
import { getCurrentUser } from "@/lib/dal";

export default async function AdminLayout({ children }) {
  const admin = await getCurrentUser();
  return <AdminShell admin={admin}>{children}</AdminShell>;
}