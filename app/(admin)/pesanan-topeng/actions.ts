"use server";

import { revalidatePath } from "next/cache";
import { requireAdminInAction } from "@/lib/admin-guard";
import { serverApi } from "@/lib/server-api";

// Sesuaikan dengan daftar status yang dipakai backend-mu.
const ALLOWED_STATUS = ["menunggu", "dibayar", "diproses", "selesai", "dibatalkan"];

export async function updateOrderStatusAction(orderId: string, status: string) {
  // 1) Cek role DI DALAM action (bukan hanya di layout/proxy)
  const guard = await requireAdminInAction();
  if (!guard.ok) {
    return { success: false, error: guard.error, message: guard.message };
  }

  // 2) Validasi input dari klien
  if (!ALLOWED_STATUS.includes(status)) {
    return { success: false, error: "BAD_REQUEST", message: "Status tidak valid." };
  }

  // 3) Backend tetap memeriksa lagi lewat requireAdmin
  const res = await serverApi(`/topeng/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: { status },
  });

  if (res.status === 404) return { success: false, error: "NOT_FOUND", message: "Pesanan tidak ditemukan." };
  if (res.status === 403) return { success: false, error: "FORBIDDEN", message: "Ditolak oleh server." };
  if (!res.ok) return { success: false, error: "FAILED", message: res.data?.error || "Gagal mengubah status." };

  revalidatePath("/pesanan-topeng");
  return { success: true, message: "Status pesanan diperbarui." };
}