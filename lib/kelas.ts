import { validateForm } from "@/lib/validation";
import type { FieldDef, FieldErrors } from "@/types/crud";
import type { Kelas, KelasFormState } from "@/types/kelas";

/** Field yang divalidasi di form edit kelas */
export const KELAS_FIELDS: FieldDef[] = [
  { name: "name", label: "Nama", required: true },
  { name: "priceInfo", label: "Harga" },
];

export function initialKelasForm(f: Kelas): KelasFormState {
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

export function validateKelas(s: KelasFormState): FieldErrors | null {
  const result = validateForm(KELAS_FIELDS, { name: s.name, priceInfo: s.priceInfo });
  return result.ok ? null : result.errors;
}

/** Layanan event tidak punya metode bayar, jadi paymentMethods tidak dikirim */
export function buildKelasPayload(s: KelasFormState, isEvent: boolean): Record<string, unknown> {
  const payload: Record<string, unknown> = {
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