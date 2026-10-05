"use client";
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { useToast } from "@/components/Toast";

interface Point { id: string; year: string; text: string }
interface Culture { timeline: Point[]; paragraph: string; updatedAt?: string }

export default function KelolaEdukasiPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => api<{ cultureInfo: Culture }>("/culture"));
  const [paragraph, setParagraph] = useState("");
  const [year, setYear] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setParagraph(data.cultureInfo.paragraph || "");
  }, [data]);

  async function saveParagraph(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/culture", { method: "PUT", body: { paragraph } });
      toast("Paragraf edukasi disimpan.");
      reload();
    } catch (err: any) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function addPoint(e: FormEvent) {
    e.preventDefault();
    if (!year.trim() || !text.trim()) return toast("Tahun dan keterangan wajib diisi.");
    try {
      await api("/culture/timeline", { method: "POST", body: { year, text } });
      setYear("");
      setText("");
      toast("Poin linimasa ditambahkan.");
      reload();
    } catch (err: any) {
      toast(err.message);
    }
  }

  async function delPoint(p: Point) {
    if (!confirm(`Hapus poin "${p.year}"?`)) return;
    try {
      await api(`/culture/timeline/${p.id}`, { method: "DELETE" });
      toast("Poin dihapus.");
      reload();
    } catch (err: any) {
      toast(err.message);
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
        <button className="a-btn a-btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan paragraf"}</button>
      </form>

      <div className="a-card a-card-pad">
        <h3 style={{ marginBottom: 12 }}>Linimasa sejarah</h3>
        {data?.cultureInfo.timeline.length === 0 && <div className="a-empty">Belum ada poin.</div>}
        {data?.cultureInfo.timeline.map((p) => (
          <div className="a-review-row" key={p.id}>
            <div className="a-review-head">
              <strong>{p.year}</strong>
              <button className="a-btn a-btn-danger a-btn-sm" onClick={() => delPoint(p)}>Hapus</button>
            </div>
            <div style={{ fontSize: "0.88rem" }}>{p.text}</div>
          </div>
        ))}
        <form onSubmit={addPoint} style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
          <div className="a-field"><label>Tahun / periode</label><input value={year} onChange={(e) => setYear(e.target.value)} placeholder="mis. 1976-1985" /></div>
          <div className="a-field"><label>Keterangan</label><textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} /></div>
          <button className="a-btn a-btn-gold">+ Tambah poin</button>
        </form>
      </div>
    </div>
  );
}
