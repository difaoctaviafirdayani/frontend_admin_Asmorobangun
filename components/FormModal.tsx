"use client";
import { FormEvent, useState } from "react";
import Modal from "./Modal";
import ImageField from "./ImageField";
import type { FieldDef } from "./CrudPage";
import { formatRupiah } from "@/lib/format";

/** FieldDef + opsi tambahan: money = input uang (awalan Rp + pratinjau 0,00), full = lebar penuh. */
export type FormField = FieldDef & { money?: boolean; full?: boolean };

interface Props {
  title: string;
  fields: FormField[];
  initial?: Record<string, any>;
  submitLabel?: string;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  onClose: () => void;
  /** validasi tambahan (mis. Zod); kembalikan { namaField: "pesan" } atau null kalau valid */
  validate?: (values: Record<string, any>) => Record<string, string> | null;
}

/** Popup form rapi (2 kolom). Error per-field tampil merah di bawah isian, error server tampil di banner. */
export default function FormModal({ title, fields, initial, submitLabel = "Simpan", onSubmit, onClose, validate }: Props) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const v: Record<string, any> = {};
    fields.forEach((f) => (v[f.name] = initial?.[f.name] ?? ""));
    return v;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (name: string, v: any) => {
    setValues((old) => ({ ...old, [name]: v }));
    setErrors((old) => {
      if (!old[name]) return old;
      const next = { ...old };
      delete next[name];
      return next;
    });
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    const found: Record<string, string> = { ...(validate?.(values) ?? {}) };
    for (const f of fields) {
      if (f.required && !String(values[f.name] ?? "").trim()) found[f.name] = `${f.label} wajib diisi.`;
    }
    if (Object.keys(found).length) {
      setErrors(found);
      setFormError("Periksa kembali isian yang ditandai merah.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} noValidate className="a-form-grid">
        {formError && <div className="a-form-banner error full">{formError}</div>}

        {fields.map((f) => {
          const err = errors[f.name];
          const wide = f.full || f.type === "textarea" || f.type === "image";

          if (f.type === "image") {
            return (
              <div className="full" key={f.name}>
                <ImageField label={f.label} value={values[f.name] || ""} onChange={(v) => set(f.name, v)} />
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
                <textarea rows={f.rows || 4} value={values[f.name] ?? ""} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
              ) : f.type === "select" ? (
                <select value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}>
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
                    <input type="number" inputMode="decimal" min={0} step="any" value={values[f.name] ?? ""} placeholder="0" onChange={(e) => set(f.name, e.target.value)} />
                  </div>
                  <div className="a-field-hint">Tampil sebagai {formatRupiah(values[f.name])}</div>
                </>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  min={f.type === "number" ? 0 : undefined}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
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