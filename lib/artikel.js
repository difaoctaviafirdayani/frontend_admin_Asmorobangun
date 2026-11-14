import { formatDate } from "@/lib/format";

export const KATEGORI_ARTIKEL = ["Berita", "Budaya", "Sejarah", "Acara"];

/**
 * @param {import("@/types/artikel").ArtikelApi} a
 * @returns {import("@/types/artikel").Artikel}
 */
export function toArtikelView(a) {
  return { ...a, date: formatDate(a.date) };
}