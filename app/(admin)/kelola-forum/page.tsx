"use client";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { formatDate, formatDateTime } from "@/lib/format";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface ThreadSummary { id: string; category: string; title: string; userName: string; date: string; replyCount: number }
interface Thread extends ThreadSummary {
  content: string;
  replies: { id: string; userName: string; content: string; date: string }[];
}

export default function KelolaForumPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => api<{ threads: ThreadSummary[] }>("/forum"));
  const [thread, setThread] = useState<Thread | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function open(id: string) {
    try {
      const { thread: t } = await api<{ thread: Thread }>(`/forum/${id}`);
      setThread(t);
      setTitle(t.title);
      setCategory(t.category);
      setContent(t.content);
    } catch (e: any) {
      toast(e.message);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!thread) return;
    setSaving(true);
    try {
      await api(`/forum/${thread.id}`, { method: "PATCH", body: { title, category, content } });
      toast("Diskusi diperbarui.");
      setThread(null);
      reload();
    } catch (err: any) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string, name: string) {
    if (!confirm(`Hapus diskusi "${name}" beserta semua balasannya?`)) return;
    try {
      await api(`/forum/${id}`, { method: "DELETE" });
      toast("Diskusi dihapus.");
      setThread(null);
      reload();
    } catch (err: any) {
      toast(err.message);
    }
  }

  const rows = data?.threads || [];

  return (
    <>
      <div className="a-card">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead><tr><th>Judul</th><th>Kategori</th><th>Penulis</th><th>Balasan</th><th>Tanggal</th><th>Aksi</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={6}>Memuat...</td></tr>}
              {error && <tr><td colSpan={6} className="a-empty">{error}</td></tr>}
              {!loading && !error && rows.length === 0 && <tr><td colSpan={6} className="a-empty">Belum ada diskusi.</td></tr>}
              {rows.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.title}</strong></td>
                  <td>{t.category}</td>
                  <td>{t.userName}</td>
                  <td>{t.replyCount}</td>
                  <td>{formatDate(t.date)}</td>
                  <td>
                    <div className="a-actions">
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => open(t.id)}>Moderasi</button>
                      <button className="a-btn a-btn-danger a-btn-sm" onClick={() => del(t.id, t.title)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {thread && (
        <Modal title="Moderasi diskusi" onClose={() => setThread(null)} wide>
          <form onSubmit={save}>
            <div className="a-field"><label>Judul</label><input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="a-field"><label>Kategori</label><input value={category} onChange={(e) => setCategory(e.target.value)} /></div>
            <div className="a-field"><label>Isi diskusi</label><textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} /></div>
            <div className="a-muted" style={{ marginBottom: 6 }}>Ditulis oleh {thread.userName} · {formatDateTime(thread.date)}</div>

            <div className="a-sublabel" style={{ marginTop: 12 }}>Balasan ({thread.replies.length})</div>
            <div className="a-chat">
              {thread.replies.length === 0 && <div className="a-muted">Belum ada balasan.</div>}
              {thread.replies.map((r) => (
                <div className="a-chat-msg" key={r.id}>
                  {r.content}
                  <div className="a-muted">{r.userName} · {formatDateTime(r.date)}</div>
                </div>
              ))}
            </div>
            <div className="a-modal-foot">
              <button type="button" className="a-btn a-btn-danger" onClick={() => del(thread.id, thread.title)}>Hapus diskusi</button>
              <button type="button" className="a-btn a-btn-ghost" onClick={() => setThread(null)}>Batal</button>
              <button className="a-btn a-btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
