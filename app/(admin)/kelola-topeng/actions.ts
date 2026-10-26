"use server";

import { revalidatePath } from "next/cache";
import { requireAdminInAction } from "@/lib/guard";
import { serverApi } from "@/lib/server-api";
import { TopengSchema, type ActionState } from "@/lib/schemas";

// Catatan IDOR: katalog topeng dikelola admin (bukan data milik tiap user), jadi
// "pemilik" di sini = peran admin. ID dari action.bind(null, id) TIDAK dipercaya:
// yang menentukan boleh-tidaknya adalah sesi di cookie (server), lalu backend
// memeriksa lagi lewat requireAdmin. ID yang tidak ada => 404.

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

// Dipakai: deleteTopengAction.bind(null, id)()
export async function deleteTopengAction(topengId: string): Promise<ActionState> {
  const guard = await requireAdminInAction();
  if (!guard.ok) return { success: false, message: guard.message };

  const res = await serverApi(`/topeng/${encodeURIComponent(topengId)}`, { method: "DELETE" });

  if (res.status === 404) return { success: false, message: "Topeng tidak ditemukan (404)." };
  if (res.status === 403) return { success: false, message: "FORBIDDEN: kamu tidak berhak menghapus data ini." };
  if (!res.ok) return { success: false, message: res.data?.error || "Gagal menghapus topeng." };

  revalidatePath("/kelola-topeng");
  return { success: true, message: "Topeng dihapus." };
}

// Dipakai: updateTopengAction.bind(null, id)(prevState, formData)
export async function updateTopengAction(
  topengId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. login + role
  const guard = await requireAdminInAction();
  if (!guard.ok) return { success: false, message: guard.message };

  // 2. validasi (Zod safeParse, tanpa throw)
  const rawData = {
    name: text(formData, "name"),
    character: text(formData, "character"),
    price: text(formData, "price"),
    stock: text(formData, "stock"),
    color: text(formData, "color"),
    image: text(formData, "image"),
    desc: text(formData, "desc"),
  };
  const parsed = TopengSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali isian form.",
      errors: parsed.error.flatten().fieldErrors,
      values: rawData,
    };
  }

  // 3. mutasi ke backend (token dari cookie httpOnly)
  const res = await serverApi(`/topeng/${encodeURIComponent(topengId)}`, {
    method: "PATCH",
    body: parsed.data,
  });

  if (res.status === 404) return { success: false, message: "Topeng tidak ditemukan (404).", values: rawData };
  if (res.status === 403) return { success: false, message: "FORBIDDEN: kamu tidak berhak mengubah data ini.", values: rawData };
  if (!res.ok) return { success: false, message: res.data?.error || "Gagal menyimpan perubahan.", values: rawData };

  // 4. segarkan cache
  revalidatePath("/kelola-topeng");
  return { success: true, message: "Topeng diperbarui." };
}