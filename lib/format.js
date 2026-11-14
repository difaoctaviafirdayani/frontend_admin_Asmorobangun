/**
 * @param {string | null} [iso]
 * @returns {string}
 */
export function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * @param {string | null} [iso]
 * @returns {string}
 */
export function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Format uang: selalu dua desimal, nol pun ditulis "Rp 0,00" (mis. Rp 350.000,00).
const RUPIAH = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * @param {number | string | null} [n]
 * @returns {string}
 */
export function formatRupiah(n) {
  const v = n === null || n === undefined || n === "" ? 0 : Number(n);
  return "Rp " + RUPIAH.format(isNaN(v) ? 0 : v);
}

/**
 * @param {string | null | undefined} s
 * @param {number} n
 * @returns {string}
 */
export function truncate(s, n) {
  const t = s || "";
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

/** @type {Record<string, string>} */
export const BOOKING_STATUS = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  menunggu_verifikasi: "Menunggu Verifikasi",
  menunggu_kedatangan: "Menunggu Kedatangan",
  menunggu_konfirmasi_admin: "Menunggu Konfirmasi",
  dikonfirmasi: "Dikonfirmasi",
  ditolak: "Ditolak",
  selesai: "Selesai",
};

/** @type {Record<string, string>} */
export const ORDER_STATUS = {
  menunggu_konfirmasi_admin: "Menunggu Konfirmasi",
  menunggu_verifikasi: "Menunggu Verifikasi",
  dikonfirmasi: "Dikonfirmasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

/**
 * @param {string} s
 * @returns {"ok" | "bad" | "wait"}
 */
export function statusTone(s) {
  if (["dikonfirmasi", "selesai", "dikirim"].includes(s)) return "ok";
  if (s === "ditolak") return "bad";
  return "wait";
}

/** @type {Record<string, string>} */
export const PAYMENT_LABEL = { qris: "QRIS", transfer: "Transfer Bank", cash: "Tunai" };

/**
 * Ubah 0812... / +62812... menjadi format wa.me (62812...).
 * @param {string | null} [phone]
 * @param {string} [text]
 * @returns {string}
 */
export function waLink(phone, text) {
  let p = (phone || "").replace(/\D/g, "");
  if (p.startsWith("0")) p = "62" + p.slice(1);
  if (!p) return "";
  return `https://wa.me/${p}${text ? "?text=" + encodeURIComponent(text) : ""}`;
}

/** @param {string} s */
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * @param {unknown} err
 * @param {string} [fallback]
 */
export function getErrorMessage(err, fallback = "Terjadi kesalahan.") {
  return err instanceof Error ? err.message : fallback;
}