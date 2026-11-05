import type { FieldDef, FieldErrors, FormValues } from "@/types/crud";

function check(f: FieldDef, raw: unknown): string | null {
  const v = raw == null ? "" : String(raw).trim();

  if (f.required && v === "") return `${f.label} wajib diisi.`;
  if (v === "") return null;

  if (f.type === "number") {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) {
      return `${f.label} harus berupa angka 0 atau lebih.`;
    }
  }
  if (f.type === "select" && f.options?.length) {
    if (!f.options.some((o) => o.value === v)) return `${f.label} tidak valid.`;
  }
  return null;
}

export function validateForm(
  fields: FieldDef[],
  values: FormValues
): { ok: true } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  for (const f of fields) {
    const msg = check(f, values[f.name]);
    if (msg) errors[f.name] = msg;
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true };
}