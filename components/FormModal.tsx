"use client";
import { FormEvent, useState } from "react";
import Modal from "./Modal";
import ImageField from "./ImageField";
import { useToast } from "./Toast";
import { getErrorMessage } from "@/lib/format";
import { validateForm } from "@/lib/validation";
import type { FieldDef, FieldErrors, FormValues } from "@/types/crud";

interface Props {
  title: string;
  fields: FieldDef[];
  /** nilai awal form (kosong / default untuk tambah, data baris untuk edit) */
  initial: FormValues;
  /** dipanggil saat Simpan; kalau melempar error, pesannya tampil di toast */
  onSubmit: (values: FormValues) => Promise<void>;
  onClose: () => void;
}

/** Form popup: dipakai halaman admin untuk Tambah / Edit data ke backend. */
export default function FormModal({ title, fields, initial, onSubmit, onClose }: Props) {
  const toast = useToast();
  const [values, setValues] = useState<FormValues>(() => {
    const v: FormValues = {};
    fields.forEach((f) => (v[f.name] = initial[f.name] ?? ""));
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
    if (!result.ok) {
      setErrors(result.errors);
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
      <form onSubmit={submit} noValidate>
        {fields.map((f) => {
          const set = (v: unknown) => setField(f.name, v);
          const err = errors[f.name];
          const val = String(values[f.name] ?? "");

          if (f.type === "image") {
            return (
              <div key={f.name}>
                <ImageField label={f.label} value={val} onChange={set} />
                {err && <div className="a-field-error">{err}</div>}
              </div>
            );
          }

          return (
            <div className={`a-field${err ? " has-error" : ""}`} key={f.name}>
              <label>{f.label}{f.required && " *"}</label>
              {f.type === "textarea" ? (
                <textarea rows={f.rows || 4} value={val} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} />
              ) : f.type === "select" ? (
                <select value={val} onChange={(e) => set(e.target.value)}>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  min={f.type === "number" ? 0 : undefined}
                  value={val}
                  placeholder={f.placeholder}
                  onChange={(e) => set(e.target.value)}
                />
              )}
              {err && <div className="a-field-error">{err}</div>}
              {f.hint && <div className="a-field-hint">{f.hint}</div>}
            </div>
          );
        })}
        <div className="a-modal-foot">
          <button type="button" className="a-btn a-btn-ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="a-btn a-btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
        </div>
      </form>
    </Modal>
  );
}