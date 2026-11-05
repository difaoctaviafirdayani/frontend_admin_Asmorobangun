"use client";
import { FormEvent, useState } from "react";
import Modal from "./Modal";
import ImageField from "./ImageField";
import { useToast } from "./Toast";
import { formatRupiah, getErrorMessage } from "@/lib/format";
import { validateForm } from "@/lib/validation";
import type { FieldDef, FieldErrors, FormValues } from "@/types/crud";

/** FieldDef + opsi tambahan: money = input uang (awalan Rp + pratinjau 0,00), full = lebar penuh. */
export type FormField = FieldDef & { money?: boolean; full?: boolean };

interface Props {
  title: string;
  fields: FormField[];
  /** nilai awal form (kosong / default untuk tambah, data baris untuk edit) */
  initial?: FormValues;
  submitLabel?: string;
  /** dipanggil saat Simpan; kalau melempar error, pesannya tampil di toast */
  onSubmit: (values: FormValues) => Promise<void> | void;
  onClose: () => void;
  /** validasi tambahan (mis. Zod); kembalikan { namaField: "pesan" } atau null kalau valid */
  validate?: (values: Record<string, any>) => Record<string, string> | null;
}

/** Popup form (2 kolom) untuk Tambah/Edit data. Error per-field tampil merah di bawah isian, error server lewat toast. */
export default function FormModal({ title, fields, initial, submitLabel = "Simpan", onSubmit, onClose, validate }: Props) {
  const toast = useToast();
  const [values, setValues] = useState<FormValues>(() => {
    const v: FormValues = {};
    fields.forEach((f) => (v[f.name] = initial?.[f.name] ?? ""));
    return v;
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  function setField(name: string, value: unknown) {
    setValues((old) => ({ ...old, [name]: value }));
    setErrors((old) => {
      if (!old[name]) return old;
      const { [name]: _removed, ...rest } = old;
      return rest;
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();

    const result = validateForm(fields, values);
    const extra = validate?.(values) ?? null;
    const found: FieldErrors = { ...(result.ok ? {} : result.errors), ...(extra ?? {}) };
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      toast(getErrorMessage(err, "Gagal menyimpan."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} noValidate className="a-form-grid">
        {fields.map((f) => {
          const set = (v: unknown) => setField(f.name, v);
          const err = errors[f.name];
          const val = String(values[f.name] ?? "");
          const wide = f.full || f.type === "textarea" || f.type === "image";

          if (f.type === "image") {
            return (
              <div className="full" key={f.name}>
                <ImageField label={f.label} value={val} onChange={set} />
                {err && <div className="a-field-error">{err}</div>}
              </div>
            );
          }

          return (
            <div className={`a-field${err ? " has-error" : ""}${wide ? " full" : ""}`} key={f.name}>
              <label>
                {f.label}
                {f.required && " *"}
              </label>

              {f.type === "textarea" ? (
                <textarea rows={f.rows || 4} value={val} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} />
              ) : f.type === "select" ? (
                <select value={val} onChange={(e) => set(e.target.value)}>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : f.money ? (
                <>
                  <div className="a-money">
                    <span>Rp</span>
                    <input type="number" inputMode="decimal" min={0} step="any" value={val} placeholder="0" onChange={(e) => set(e.target.value)} />
                  </div>
                  <div className="a-field-hint">Tampil sebagai {formatRupiah(val)}</div>
                </>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  min={f.type === "number" ? 0 : undefined}
                  value={val}
                  placeholder={f.placeholder}
                  onChange={(e) => set(e.target.value)}
                />
              )}

              {f.hint && <div className="a-field-hint">{f.hint}</div>}
              {err && <div className="a-field-error">{err}</div>}
            </div>
          );
        })}

        <div className="a-modal-foot full">
          <button type="button" className="a-btn a-btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
            {saving ? "Menyimpan..." : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}