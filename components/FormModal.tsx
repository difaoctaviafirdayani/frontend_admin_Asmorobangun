"use client";
import { FormEvent, useState } from "react";
import Modal from "./Modal";
import ImageField from "./ImageField";
import { useToast } from "./Toast";
import type { FieldDef } from "./CrudPage";

interface Props {
  title: string;
  fields: FieldDef[];
  /** nilai awal form (kosong / default untuk tambah, data baris untuk edit) */
  initial: Record<string, any>;
  /** dipanggil saat Simpan; kalau melempar error, pesannya tampil di toast */
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onClose: () => void;
}

/** Form popup sederhana: dipakai halaman admin untuk Tambah / Edit data ke backend. */
export default function FormModal({ title, fields, initial, onSubmit, onClose }: Props) {
  const toast = useToast();
  const [values, setValues] = useState<Record<string, any>>(() => {
    const v: Record<string, any> = {};
    fields.forEach((f) => (v[f.name] = initial[f.name] ?? ""));
    return v;
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !String(values[f.name] ?? "").trim()) {
        return toast(`${f.label} wajib diisi.`);
      }
    }
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err: any) {
      toast(err.message || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit}>
        {fields.map((f) => {
          const set = (v: any) => setValues((old) => ({ ...old, [f.name]: v }));
          if (f.type === "image") {
            return <ImageField key={f.name} label={f.label} value={values[f.name] || ""} onChange={set} />;
          }
          return (
            <div className="a-field" key={f.name}>
              <label>{f.label}{f.required && " *"}</label>
              {f.type === "textarea" ? (
                <textarea rows={f.rows || 4} value={values[f.name] ?? ""} placeholder={f.placeholder} onChange={(e) => set(e.target.value)} />
              ) : f.type === "select" ? (
                <select value={values[f.name] ?? ""} onChange={(e) => set(e.target.value)}>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  min={f.type === "number" ? 0 : undefined}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(e.target.value)}
                />
              )}
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