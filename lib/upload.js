// Upload file: validasi di klien dulu, baru kirim ke backend.
// Backend menyimpan file ke MySQL (tabel media_files) dan mengembalikan URL-nya.
import { api } from "@/lib/api";

export const MAX_IMAGE_MB = 8;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * @typedef {{
 *   name: string,
 *   url: string
 * }} UploadedFile
 * `url` mis. /uploads/site_images/abc.jpg -> simpan nilai ini di database
 */

/**
 * Kembalikan pesan masalah, atau null kalau file boleh diunggah.
 * @param {File} file
 * @returns {string | null}
 */
export function validateImage(file) {
  const okType = ALLOWED_IMAGE_TYPES.includes(file.type);
  if (!okType) return "Format gambar harus JPG, PNG, WEBP, atau GIF.";
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) return `Ukuran gambar maksimal ${MAX_IMAGE_MB} MB.`;
  return null;
}

/**
 * @param {File} file
 * @returns {Promise<UploadedFile>}
 */
export async function uploadImage(file) {
  const problem = validateImage(file);
  if (problem) throw new Error(problem);

  const form = new FormData();
  form.append("image", file);
  const res = await api("/uploads/image", { method: "POST", form });
  return res.item;
}