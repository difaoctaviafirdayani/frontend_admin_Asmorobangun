import { formatDate } from "@/lib/format";
import type { Artikel, ArtikelApi } from "@/types/artikel";

export const KATEGORI_ARTIKEL = ["Berita", "Budaya", "Sejarah", "Acara"] as const;

export function toArtikelView(a: ArtikelApi): Artikel {
  return { ...a, date: formatDate(a.date) };
}