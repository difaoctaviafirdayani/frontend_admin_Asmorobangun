"use client";
import { FormEvent, ReactNode, useState } from "react";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import Modal from "./Modal";
import ImageField from "./ImageField";
import { useToast } from "./Toast";

export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "image";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  rows?: number;
  hint?: string;
}

export interface ColumnDef<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface Props<T extends { id: string }> {
  /** GET endpoint daftar, mis. "/topeng" */
  endpoint: string;
  /** key array pada respons, mis. "topeng" */
  listKey: string;
  /** nama benda, untuk teks tombol & pesan, mis. "topeng" */
  noun: string;
  columns: ColumnDef<T>[];
  fields: FieldDef[];
  /** nilai awal form tambah */
  defaults?: Record<string, any>;
  createPath: string;
  updatePath: (row: T) => string;
  deletePath: (row: T) => string;
  rowName: (row: T) => string;
  /** ubah nilai form sebelum dikirim */
  toPayload?: (values: Record<string, any>) => Record<string, any>;
}

export default function CrudPage<T extends { id: string }>(p: Props<T>) {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => api<any>(p.endpoint), [p.endpoint]);
  const rows: T[] = data ? data[p.listKey] || [] : [];

  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  function openNew() {
    setValues({ ...(p.defaults || {}) });
    setEditing("new");
  }
  function openEdit(row: T) {
    const v: Record<string, any> = {};
    p.fields.forEach((f) => (v[f.name] = (row as any)[f.name] ?? ""));
    setValues(v);
    setEditing(row);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    for (const f of p.fields) {
      if (f.required && !String(values[f.name] ?? "").trim()) {
        return toast(`${f.label} wajib diisi.`);
      }
    }
    const payload = p.toPayload ? p.toPayload(values) : values;
    setSaving(true);
    try {
      if (editing === "new") {
        await api(p.createPath, { method: "POST", body: payload });
        toast(`${cap(p.noun)} ditambahkan.`);
      } else if (editing) {
        await api(p.updatePath(editing), { method: "PATCH", body: payload });
        toast(`${cap(p.noun)} diperbarui.`);
      }
      setEditing(null);
      reload();
    } catch (err: any) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: T) {
    if (!confirm(`Hapus ${p.noun} "${p.rowName(row)}"?`)) return;
    try {
      await api(p.deletePath(row), { method: "DELETE" });
      toast(`${cap(p.noun)} dihapus.`);
      reload();
    } catch (err: any) {
      toast(err.message);
    }
  }

  return (
    <>
      <div className="a-toolbar">
        <div className="a-muted">{rows.length} {p.noun}</div>
        <button className="a-btn a-btn-primary" onClick={openNew}>+ Tambah {p.noun}</button>
      </div>

      <div className="a-card">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                {p.columns.map((c) => <th key={c.header}>{c.header}</th>)}
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={p.columns.length + 1}>Memuat...</td></tr>}
              {error && <tr><td colSpan={p.columns.length + 1} className="a-empty">{error}</td></tr>}
              {!loading && !error && rows.length === 0 && (
                <tr><td colSpan={p.columns.length + 1} className="a-empty">Belum ada {p.noun}.</td></tr>
              )}
              {rows.map((row) => (
                <tr key={row.id}>
                  {p.columns.map((c) => <td key={c.header}>{c.render(row)}</td>)}
                  <td>
                    <div className="a-actions">
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => openEdit(row)}>Edit</button>
                      <button className="a-btn a-btn-danger a-btn-sm" onClick={() => remove(row)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing === "new" ? `Tambah ${p.noun}` : `Edit ${p.noun}`} onClose={() => setEditing(null)}>
          <form onSubmit={submit}>
            {p.fields.map((f) => {
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
              <button type="button" className="a-btn a-btn-ghost" onClick={() => setEditing(null)}>Batal</button>
              <button type="submit" className="a-btn a-btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
