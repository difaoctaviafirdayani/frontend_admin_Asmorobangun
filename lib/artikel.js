import { formatDate } from "@/lib/format";

export const KATEGORI_ARTIKEL = ["Budaya", "Sejarah", "Pencapaian"];

/**
 * @param {import("@/types/artikel").ArtikelApi} a
 * @returns {import("@/types/artikel").Artikel}
 */
export function toArtikelView(a) {
  return { ...a, date: formatDate(a.date) };
}