import { formatDate } from "@/lib/format";
import type { Pengumuman, PengumumanApi } from "@/types/pengumuman";

export function toPengumumanView(a: PengumumanApi): Pengumuman {
  return {
    ...a,
    category: a.type,
    content: a.body,
    date: formatDate(a.date),
  };
}