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

/** Status pendaftaran layanan. */
/** @type {Record<string, string>} */
export const BOOKING_STATUS = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  menunggu_verifikasi: "Menunggu Verifikasi",
  menunggu_kedatangan: "Menunggu Kedatangan",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

/** Status pesanan topeng. */
/** @type {Record<string, string>} */
export const ORDER_STATUS = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  menunggu_verifikasi: "Menunggu Verifikasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

/**
 * @param {string} s
 * @returns {"ok" | "bad" | "wait"}
 */
export function statusTone(s) {
  if (["menunggu_kedatangan", "diproses", "selesai", "dikirim"].includes(s)) return "ok";
  if (s === "dibatalkan") return "bad";
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

/**
 * Info pembatalan dari pembeli (field dari API admin: cancelReason, refundAccount, cancelledAt).
 * `byUser` = true bila dibatalkan lewat tombol Batalkan di aplikasi (ada alasan tercatat),
 * false bila dibatalkan otomatis (tidak dibayar 24 jam) atau diubah manual oleh admin.
 * @param {{ status?: string, cancelReason?: string | null, refundAccount?: string | null, cancelledAt?: string | null, proofFile?: string | null }} item
 * @returns {{ byUser: boolean, reason: string, refundAccount: string, cancelledAt: string, needsRefund: boolean } | null}
 */
export function cancelInfo(item) {
  if (item.status !== "dibatalkan") return null;
  const reason = (item.cancelReason || "").trim();
  const refundAccount = (item.refundAccount || "").trim();
  return {
    byUser: reason.length > 0,
    reason: reason || "Dibatalkan otomatis (tidak dibayar dalam 24 jam) atau oleh admin.",
    refundAccount,
    cancelledAt: formatDateTime(item.cancelledAt),
    needsRefund: refundAccount.length > 0,
  };
}

/**
 * Tautan WhatsApp untuk menghubungi pemesan soal pembatalan/pengembalian dana.
 * @param {string | null | undefined} phone
 * @param {string} nama Nama layanan atau topeng
 * @param {boolean} [refund]
 * @returns {string} "" bila nomor tidak ada
 */
export function cancelWaLink(phone, nama, refund = false) {
  const text = refund
    ? `Halo, kami dari Sanggar Asmorobangun. Terkait pembatalan "${nama}", kami akan memproses pengembalian dana. Mohon konfirmasi data rekening Anda.`
    : `Halo, kami dari Sanggar Asmorobangun. Pembatalan "${nama}" sudah kami terima.`;
  return waLink(phone, text);
}
