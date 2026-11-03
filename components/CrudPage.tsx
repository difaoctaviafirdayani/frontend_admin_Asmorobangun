"use client";
import { useCrud } from "@/hooks/useCrud";
import type { CrudPageProps, HasId } from "@/types/crud";
import Modal from "./Modal";
import ImageField from "./ImageField";

// sementara, biar import lama di halaman kelola-* nggak pecah
export type { FieldDef, ColumnDef } from "@/types/crud";

export default function CrudPage<T extends HasId>(p: CrudPageProps<T>) {
  const {
    rows, loading, error, editing, values, errors, saving,
    openNew, openEdit, close, setField, submit, remove,
  } = useCrud(p);

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
        <Modal title={editing === "new" ? `Tambah ${p.noun}` : `Edit ${p.noun}`} onClose={close}>
          <form onSubmit={submit} noValidate>
            {p.fields.map((f) => {
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
              <button type="button" className="a-btn a-btn-ghost" onClick={close}>Batal</button>
              <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}