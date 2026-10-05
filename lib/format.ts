export function formatDate(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatRupiah(n?: number | string | null): string {
  const v = Number(n);
  if (n === null || n === undefined || n === "" || isNaN(v)) return "-";
  return "Rp " + v.toLocaleString("id-ID");
}

export function truncate(s: string | undefined | null, n: number): string {
  const t = s || "";
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

export const BOOKING_STATUS: Record<string, string> = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  menunggu_verifikasi: "Menunggu Verifikasi",
  menunggu_kedatangan: "Menunggu Kedatangan",
  menunggu_konfirmasi_admin: "Menunggu Konfirmasi",
  dikonfirmasi: "Dikonfirmasi",
  ditolak: "Ditolak",
  selesai: "Selesai",
};

export const ORDER_STATUS: Record<string, string> = {
  menunggu_konfirmasi_admin: "Menunggu Konfirmasi",
  menunggu_verifikasi: "Menunggu Verifikasi",
  dikonfirmasi: "Dikonfirmasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

export function statusTone(s: string): "ok" | "bad" | "wait" {
  if (["dikonfirmasi", "selesai", "dikirim"].includes(s)) return "ok";
  if (s === "ditolak") return "bad";
  return "wait";
}

export const PAYMENT_LABEL: Record<string, string> = { qris: "QRIS", transfer: "Transfer Bank", cash: "Tunai" };

/** Ubah 0812... / +62812... menjadi format wa.me (62812...). */
export function waLink(phone?: string | null, text?: string): string {
  let p = (phone || "").replace(/\D/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  if (!p) return "";
  return `https://wa.me/${p}${text ? "?text=" + encodeURIComponent(text) : ""}`;
}
