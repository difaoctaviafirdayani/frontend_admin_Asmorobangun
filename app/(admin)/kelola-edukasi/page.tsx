"use client";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { getErrorMessage } from "@/lib/format";
import { validateForm } from "@/lib/validation";
import { useToast } from "@/components/Toast";
import type { FieldDef, FieldErrors } from "@/types/crud";
import type { CultureInfo, TimelinePoint } from "@/types/edukasi";

const POINT_FIELDS: FieldDef[] = [
  { name: "year", label: "Tahun / periode", required: true },
  { name: "text", label: "Keterangan", required: true },
];

export default function KelolaEdukasiPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => api<{ cultureInfo: CultureInfo }>("/culture"));
  const [paragraph, setParagraph] = useState("");
  const [year, setYear] = useState("");
  const [text, setText] = useState("");
  const [pointErrors, setPointErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setParagraph(data.cultureInfo.paragraph || "");
  }, [data]);

  function clearPointError(name: string) {
    setPointErrors((old) => {
      if (!old[name]) return old;
      const { [name]: _removed, ...rest } = old;
      return rest;
    });
  }

  async function saveParagraph(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/culture", { method: "PUT", body: { paragraph } });
      toast("Paragraf edukasi disimpan.");
      reload();
    } catch (err) {
      toast(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function addPoint(e: FormEvent) {
    e.preventDefault();
    const result = validateForm(POINT_FIELDS, { year, text });
    if (!result.ok) {
      setPointErrors(result.errors);
      return;
    }
    try {
      await api("/culture/timeline", { method: "POST", body: { year: year.trim(), text: text.trim() } });
      setYear("");
      setText("");
      setPointErrors({});
      toast("Poin linimasa ditambahkan.");
      reload();
    } catch (err) {
      toast(getErrorMessage(err));
    }
  }

  async function delPoint(p: TimelinePoint) {
    if (!confirm(`Hapus poin "${p.year}"?`)) return;
    try {
      await api(`/culture/timeline/${p.id}`, { method: "DELETE" });
      toast("Poin dihapus.");
      reload();
    } catch (err) {
      toast(getErrorMessage(err));
    }
  }

  if (loading && !data) return <div className="a-empty">Memuat...</div>;
  if (error) return <div className="a-empty">{error}</div>;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <form className="a-card a-card-pad" onSubmit={saveParagraph}>
        <h3 style={{ marginBottom: 12 }}>Paragraf pengantar</h3>
        <div className="a-field">
          <textarea rows={7} value={paragraph} onChange={(e) => setParagraph(e.target.value)} />
        </div>
        <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
          {saving ? "Menyimpan..." : "Simpan paragraf"}
        </button>
      </form>

      <div className="a-card a-card-pad">
        <h3 style={{ marginBottom: 12 }}>Linimasa sejarah</h3>
        {data?.cultureInfo.timeline.length === 0 && <div className="a-empty">Belum ada poin.</div>}
        {data?.cultureInfo.timeline.map((p) => (
          <div className="a-review-row" key={p.id}>
            <div className="a-review-head">
              <strong>{p.year}</strong>
              <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => delPoint(p)}>Hapus</button>
            </div>
            <div style={{ fontSize: "0.88rem" }}>{p.text}</div>
          </div>
        ))}
        <form onSubmit={addPoint} noValidate style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
          <div className={`a-field${pointErrors.year ? " has-error" : ""}`}>
            <label>Tahun / periode *</label>
            <input
              value={year}
              onChange={(e) => { setYear(e.target.value); clearPointError("year"); }}
              placeholder="mis. 1976-1985"
            />
            {pointErrors.year && <div className="a-field-error">{pointErrors.year}</div>}
          </div>
          <div className={`a-field${pointErrors.text ? " has-error" : ""}`}>
            <label>Keterangan *</label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => { setText(e.target.value); clearPointError("text"); }}
            />
            {pointErrors.text && <div className="a-field-error">{pointErrors.text}</div>}
          </div>
          <button type="submit" className="a-btn a-btn-gold">+ Tambah poin</button>
        </form>
      </div>
    </div>
  );
}