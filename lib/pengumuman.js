import { formatDate } from "@/lib/format";

/**
 * @param {import("@/types/pengumuman").PengumumanApi} a
 * @returns {import("@/types/pengumuman").Pengumuman}
 */
export function toPengumumanView(a) {
  return {
    ...a,
    category: a.type,
    content: a.body,
    date: formatDate(a.date),
  };
}