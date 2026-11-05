"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, createTopeng, updateTopeng } from "@/lib/dal";
import { TopengSchema, ActionState } from "@/lib/schemas";

// Ambil nilai teks dari FormData. Field yang tidak ada jadi "" supaya
// Zod memberi pesan "wajib diisi", bukan error tipe data.
function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

// Satu action untuk tambah DAN edit topeng: kalau ada field "id" berarti edit.
export async function saveTopengAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Cek login (via DAL). Tanpa sesi, otomatis redirect ke /login
  const user = await getCurrentUser();

  // 2. Cek role. Hanya admin boleh mengubah topeng
  if (user.role !== "admin") {
    return { success: false, message: "Kamu tidak punya akses untuk aksi ini." };
  }

  // 3. Validasi input (Zod). Validasi klien bisa dilewati, server wajib cek
  const id = text(formData, "id");
  const rawData = {
    name: text(formData, "name"),
    character: text(formData, "character"),
    price: text(formData, "price"),
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

  // 4. Simpan lewat DAL (identitas admin diambil dari sesi/cookie)
  try {
    if (id) await updateTopeng(id, validation.data);
    else await createTopeng(validation.data);
  } catch (error: unknown) {
    console.error("Gagal menyimpan topeng:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan server saat menyimpan data.",
      values: rawData,
    };
  }

  // 5. Bersihkan cache halaman daftar supaya tidak menampilkan data lama
  revalidatePath("/kelola-topeng");

  return { success: true, message: id ? "Topeng diperbarui." : "Topeng ditambahkan." };
}