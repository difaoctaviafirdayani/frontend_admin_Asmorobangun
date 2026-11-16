import { validateForm } from "@/lib/validation";

/**
 * Field yang divalidasi di form edit kelas
 * @type {import("@/types/crud").FieldDef[]}
 */
export const KELAS_FIELDS = [
  { name: "name", label: "Nama", required: true },
  { name: "price", label: "Harga (Rp)", required: true, type: "number" },
  { name: "priceInfo", label: "Keterangan harga" },
];

/** Hari buka: 1 = Senin ... 7 = Minggu (sama dengan backend dan aplikasi user). */
export const HARI = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
  { value: 7, label: "Minggu" },
];

/**
 * @param {import("@/types/kelas").Kelas} f
 * @returns {import("@/types/kelas").KelasFormState}
 */
export function initialKelasForm(f) {
  const pm = f.paymentMethods ?? {};
  return {
    name: f.name,
    price: f.price === null || f.price === undefined ? "" : String(f.price),
    priceInfo: f.priceInfo,
    availableDays: Array.isArray(f.availableDays) ? f.availableDays.map(Number) : [],
    longDesc: f.longDesc,
    image: f.image || "",
    cashOn: pm.cash?.enabled !== false,
    cashNote: pm.cash?.note || "",
    trfOn: pm.transfer?.enabled !== false,
    trfNote: pm.transfer?.note || "",
    qrisOn: pm.qris?.enabled !== false,
    qrisImg: pm.qris?.image || "",
  };
}

/**
 * @param {import("@/types/kelas").KelasFormState} s
 * @returns {import("@/types/crud").FieldErrors | null}
 */
export function validateKelas(s) {
  const result = validateForm(KELAS_FIELDS, { name: s.name, price: s.price, priceInfo: s.priceInfo });
  /** @type {import("@/types/crud").FieldErrors} */
  const errors = result.ok ? {} : { ...result.errors };
  const price = Number(s.price);
  if (!errors.price && (!Number.isInteger(price) || price <= 0)) {
    errors.price = "Harga harus angka bulat lebih dari 0 (semua layanan berbayar).";
  }
  return Object.keys(errors).length ? errors : null;
}

/**
 * Semua layanan berbayar, jadi metode pembayaran selalu ikut dikirim.
 * availableDays kosong = buka setiap hari.
 * @param {import("@/types/kelas").KelasFormState} s
 * @returns {Record<string, unknown>}
 */
export function buildKelasPayload(s) {
  return {
    name: s.name.trim(),
    price: Number(s.price),
    priceInfo: s.priceInfo,
    availableDays: [...s.availableDays].sort((a, b) => a - b),
    longDesc: s.longDesc,
    image: s.image,
    paymentMethods: {
      cash: { enabled: s.cashOn, note: s.cashNote },
      transfer: { enabled: s.trfOn, note: s.trfNote },
      qris: { enabled: s.qrisOn, image: s.qrisImg },
    },
  };
}
