"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, createTopeng } from "@/lib/dal";
import { TopengSchema, ActionState } from "@/lib/schemas";

// Ambil nilai teks dari FormData. Field yang tidak ada jadi "" supaya
// Zod memberi pesan "wajib diisi", bukan error tipe data.
function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export async function createTopengAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. CEK LOGIN (via DAL). Tanpa sesi, otomatis redirect ke /login
  const user = await getCurrentUser();

  // 2. CEK ROLE. Hanya admin boleh menambah topeng
  if (user.role !== "admin") {
    return { success: false, message: "Kamu tidak punya akses untuk aksi ini." };
  }

  // 3. VALIDASI INPUT (Zod safeParse)
  const rawData = {
    name: text(formData, "name"),
    character: text(formData, "character"),
    price: text(formData, "price"),
    stock: text(formData, "stock"),
    color: text(formData, "color"),
    image: text(formData, "image"),
    desc: text(formData, "desc"),
  };

  const validation = TopengSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      message: "Validasi gagal. Silakan periksa kembali isian form Anda.",
      errors: validation.error.flatten().fieldErrors,
      values: rawData,
    };
  }

  // 4. MUTASI lewat DAL (identitas admin dari sesi/cookie)
  try {
    await createTopeng(validation.data);
  } catch (error: any) {
    console.error("Gagal menyimpan topeng:", error);
    return {
      success: false,
      message: error?.message || "Terjadi kesalahan server saat menyimpan data.",
      values: rawData,
    };
  }

  // 5. REVALIDASI: bersihkan cache halaman daftar supaya tidak menampilkan data lama
  revalidatePath("/kelola-topeng");

  // 6. Kembali ke halaman daftar. redirect() harus di luar try/catch
  redirect("/kelola-topeng");
}