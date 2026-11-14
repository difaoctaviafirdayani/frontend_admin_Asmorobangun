import { validateForm } from "@/lib/validation";

/**
 * Field yang divalidasi di form edit kelas
 * @type {import("@/types/crud").FieldDef[]}
 */
export const KELAS_FIELDS = [
  { name: "name", label: "Nama", required: true },
  { name: "priceInfo", label: "Harga" },
];

/**
 * @param {import("@/types/kelas").Kelas} f
 * @returns {import("@/types/kelas").KelasFormState}
 */
export function initialKelasForm(f) {
  const pm = f.paymentMethods ?? {};
  return {
    name: f.name,
    priceInfo: f.priceInfo,
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
  const result = validateForm(KELAS_FIELDS, { name: s.name, priceInfo: s.priceInfo });
  return result.ok ? null : result.errors;
}

/**
 * Layanan event tidak punya metode bayar, jadi paymentMethods tidak dikirim
 * @param {import("@/types/kelas").KelasFormState} s
 * @param {boolean} isEvent
 * @returns {Record<string, unknown>}
 */
export function buildKelasPayload(s, isEvent) {
  /** @type {Record<string, unknown>} */
  const payload = {
    name: s.name.trim(),
    priceInfo: s.priceInfo,
    longDesc: s.longDesc,
    image: s.image,
  };
  if (!isEvent) {
    payload.paymentMethods = {
      cash: { enabled: s.cashOn, note: s.cashNote },
      transfer: { enabled: s.trfOn, note: s.trfNote },
      qris: { enabled: s.qrisOn, image: s.qrisImg },
    };
  }
  return payload;
}