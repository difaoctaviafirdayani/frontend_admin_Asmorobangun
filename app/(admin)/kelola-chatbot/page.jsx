"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { getErrorMessage } from "@/lib/format";
import { validateForm } from "@/lib/validation";
import { useToast } from "@/components/Toast";

const FIELDS = [
  { name: "title", label: "Judul", required: true },
  { name: "content", label: "Isi dokumen", required: true },
];

const brown = "#5A3E2B";
const ink = "#3A2A1A";
const muted = "#8A7766";
const line = "#E6D9CB";
const red = "#A84C4C";

/* ---------- Gaya bersama ---------- */
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  border: `1px solid ${line}`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "inherit",
  color: ink,
  background: "#fff",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: ink,
  marginBottom: 6,
};

const primaryBtn = {
  background: brown,
  color: "#fff",
  border: "none",
  padding: "10px 22px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const outlineBtn = {
  background: "#fff",
  color: brown,
  border: `1px solid ${line}`,
  padding: "7px 14px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
};

const dangerBtn = { ...outlineBtn, color: red, borderColor: "#E8C9C9" };

/* Hasil pencarian yang berasal dari konten website -> halaman pengelolaannya */
function websiteSourceLink(source) {
  if (source.startsWith("Fasilitas:")) return { href: "/kelola-layanan", label: "Buka Kelola Layanan" };
  if (source.startsWith("Topeng:")) return { href: "/kelola-topeng", label: "Buka Kelola Topeng" };
  if (source.startsWith("Artikel:")) return { href: "/kelola-artikel", label: "Buka Kelola Artikel" };
  if (source.startsWith("Sejarah")) return { href: "/kelola-edukasi", label: "Buka Kelola Edukasi" };
  return null; // mis. FAQ
}

/* ---------- Komponen kecil ---------- */
function Card({ title, hint, children, onSubmit }) {
  const Tag = onSubmit ? "form" : "div";
  return (
    <Tag
      onSubmit={onSubmit}
      noValidate
      style={{
        background: "#fff",
        border: `1px solid ${line}`,
        borderRadius: 12,
        padding: 24,
        boxShadow: "0 1px 3px rgba(90,62,43,0.06)",
      }}
    >
      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: ink, margin: 0 }}>{title}</h3>
      {hint && <p style={{ fontSize: 13, color: muted, margin: "6px 0 20px", lineHeight: 1.5 }}>{hint}</p>}
      {children}
    </Tag>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <div style={{ color: red, fontSize: 12, marginTop: 5 }}>{error}</div>}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        flex: "1 1 150px",
        border: `1px solid ${line}`,
        borderRadius: 10,
        padding: "14px 16px",
        background: "#FFFDF9",
      }}
    >
      <div style={{ fontSize: 12, color: muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: ink, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#F1E8DD", fg: brown },
    ok: { bg: "#E3F0E3", fg: "#2F6B3A" },
    off: { bg: "#EEE", fg: "#777" },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        background: t.bg,
        color: t.fg,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* ---------- Halaman ---------- */
export default function KelolaChatbotPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => api("/knowledge"));
  const status = useLoad(() => api("/knowledge/status"));

  const [editingId, setEditingId] = useState(null); // null = tambah baru
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [question, setQuestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [testResult, setTestResult] = useState(null);

  const [openHit, setOpenHit] = useState(null); // index hasil pencarian yang dibuka
  const [openDoc, setOpenDoc] = useState(null); // id dokumen yang dibuka

  const docs = Array.isArray(data) ? data : data?.documents ?? [];
  const findDocByTitle = (t) => docs.find((d) => d.title === t);

  function clearError(name) {
    setErrors((old) => {
      if (!old[name]) return old;
      const { [name]: _removed, ...rest } = old;
      return rest;
    });
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setCategory("");
    setContent("");
    setErrors({});
  }

  function startEdit(d) {
    setEditingId(d.id);
    setTitle(d.title);
    setCategory(d.category || "");
    setContent(d.content);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function doTest(q) {
    if (!q.trim()) return;
    try {
      setTestResult(await api("/knowledge/test", { method: "POST", body: { question: q.trim() } }));
      setLastQuestion(q.trim());
      setOpenHit(null);
    } catch (err) {
      toast(getErrorMessage(err));
    }
  }

  // Muat ulang daftar, status, dan hasil pencarian terakhir
  async function refreshAll() {
    reload();
    status.reload();
    if (lastQuestion) await doTest(lastQuestion);
  }

  async function save(e) {
    e.preventDefault();
    const result = validateForm(FIELDS, { title, content });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setSaving(true);
    try {
      const body = { title: title.trim(), category: category.trim(), content: content.trim() };
      if (editingId) {
        await api(`/knowledge/${editingId}`, { method: "PATCH", body });
        toast("Dokumen diperbarui.");
      } else {
        await api("/knowledge", { method: "POST", body: { ...body, active: true } });
        toast("Dokumen ditambahkan.");
      }
      resetForm();
      await refreshAll();
    } catch (err) {
      toast(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(d) {
    try {
      await api(`/knowledge/${d.id}`, { method: "PATCH", body: { active: !d.active } });
      toast(d.active ? "Dokumen dinonaktifkan." : "Dokumen diaktifkan.");
      await refreshAll();
    } catch (err) {
      toast(getErrorMessage(err));
    }
  }

  async function remove(d) {
    if (!confirm(`Hapus dokumen "${d.title}"?`)) return;
    try {
      await api(`/knowledge/${d.id}`, { method: "DELETE" });
      toast("Dokumen dihapus.");
      if (editingId === d.id) resetForm();
      await refreshAll();
    } catch (err) {
      toast(getErrorMessage(err));
    }
  }

  function runTest(e) {
    e.preventDefault();
    doTest(question);
  }

  if (loading && !data) return <div className="a-empty">Memuat...</div>;
  if (error) return <div className="a-empty">{error}</div>;

  const s = status.data;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", display: "grid", gap: 22 }}>
      {/* Judul halaman */}
      <div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: "normal",
            color: ink,
            margin: 0,
            fontFamily: "'Margarine', cursive, sans-serif",
          }}
        >
          Dokumen Chatbot
        </h1>
        <p style={{ fontSize: 14, color: muted, margin: "8px 0 0", lineHeight: 1.5 }}>
          Tambahkan informasi di sini agar chatbot bisa menjawab pertanyaan pengunjung. Chatbot hanya menjawab dari
          dokumen ini dan konten website (FAQ, artikel, fasilitas, topeng).
        </p>
      </div>

      {/* Status */}
      {s && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <StatCard label="AI aktif" value={s.provider} />
          <StatCard label="Status AI" value={s.aiConfigured ? "Siap" : "API key belum diisi"} />
          <StatCard label="Dokumen aktif" value={`${s.activeDocuments} dari ${s.documents}`} />
          <StatCard label="Potongan teks dibaca" value={s.passages} />
        </div>
      )}

      {/* Form tambah / ubah */}
      <Card
        onSubmit={save}
        title={editingId ? "Ubah dokumen" : "Tambah dokumen pengetahuan"}
        hint="Tulis selengkap mungkin dan pakai kata yang biasa ditanyakan pengunjung (harga, jadwal, alamat, booking)."
      >
        <Field label="Judul *" error={errors.title}>
          <input
            style={inputStyle}
            value={title}
            maxLength={150}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError("title");
            }}
            placeholder="mis. Jadwal dan harga les tari reguler"
          />
        </Field>

        <Field label="Kategori (opsional)">
          <input
            style={inputStyle}
            value={category}
            maxLength={60}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="mis. Layanan"
          />
        </Field>

        <Field label="Isi dokumen *" error={errors.content}>
          <textarea
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            rows={8}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              clearError("content");
            }}
            placeholder="Contoh: Les tari reguler diadakan setiap hari Sabtu pukul 15.00. Biaya Rp 60.000 per pertemuan."
          />
        </Field>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={saving} style={primaryBtn}>
            {saving ? "Menyimpan..." : editingId ? "Simpan perubahan" : "+ Tambah dokumen"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} style={{ ...outlineBtn, padding: "10px 22px" }}>
              Batal
            </button>
          )}
        </div>
      </Card>

      {/* Uji pencarian */}
      <Card
        onSubmit={runTest}
        title="Uji pencarian chatbot"
        hint="Ketik contoh pertanyaan pengunjung, lalu klik hasilnya untuk melihat isi lengkap dan mengubahnya."
      >
        <div style={{ display: "flex", gap: 10 }}>
          <input
            style={{ ...inputStyle, flex: 1, minWidth: 0 }}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="mis. Berapa harga les tari?"
          />
          <button type="submit" style={primaryBtn}>
            Cek
          </button>
        </div>

        {testResult && (
          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            {testResult.found ? (
              testResult.hits.map((h, i) => {
                const isOpen = openHit === i;
                const ownDoc = findDocByTitle(h.source); // dokumen buatan admin?
                const siteLink = ownDoc ? null : websiteSourceLink(h.source);
                return (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${isOpen ? brown : line}`,
                      borderRadius: 8,
                      background: "#FFFDF9",
                      fontSize: 13,
                      overflow: "hidden",
                    }}
                  >
                    {/* Bagian yang bisa diklik */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpenHit(isOpen ? null : i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpenHit(isOpen ? null : i);
                        }
                      }}
                      style={{ padding: "12px 14px", cursor: "pointer" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <strong style={{ color: ink }}>{h.source}</strong>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <Badge tone="ok">cocok {Math.round(h.score * 100)}%</Badge>
                          <span style={{ color: muted, fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      <div style={{ color: muted, lineHeight: 1.5, whiteSpace: isOpen ? "pre-wrap" : "normal" }}>
                        {isOpen ? h.text : h.text.length > 160 ? `${h.text.slice(0, 160)}...` : h.text}
                      </div>
                      {!isOpen && (
                        <div style={{ color: brown, fontSize: 12, fontWeight: 600, marginTop: 6 }}>
                          Klik untuk lihat detail
                        </div>
                      )}
                    </div>

                    {/* Detail + aksi saat dibuka */}
                    {isOpen && (
                      <div
                        style={{
                          borderTop: `1px solid ${line}`,
                          padding: "12px 14px",
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: 8,
                          background: "#fff",
                        }}
                      >
                        {ownDoc ? (
                          <>
                            <Badge>Dokumen chatbot</Badge>
                            <button type="button" style={outlineBtn} onClick={() => startEdit(ownDoc)}>
                              Ubah dokumen
                            </button>
                            <button type="button" style={dangerBtn} onClick={() => remove(ownDoc)}>
                              Hapus dokumen
                            </button>
                          </>
                        ) : (
                          <>
                            <Badge tone="off">Data dari website</Badge>
                            {siteLink ? (
                              <Link href={siteLink.href} style={outlineBtn}>
                                {siteLink.label}
                              </Link>
                            ) : (
                              <span style={{ color: muted }}>Ubah lewat halaman pengelolaan datanya.</span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  border: "1px solid #E8C9C9",
                  background: "#FBF1F1",
                  color: red,
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 13,
                }}
              >
                Tidak ditemukan. Tambahkan dokumen yang memuat kata kunci yang sama dengan pertanyaan tadi.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Daftar dokumen */}
      <Card
        title={`Daftar dokumen (${docs.length})`}
        hint="Klik dokumen untuk melihat isi lengkap. Dokumen nonaktif tidak dibaca chatbot, tapi tetap tersimpan."
      >
        {docs.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: muted,
              fontSize: 14,
              padding: "32px 16px",
              border: `1px dashed ${line}`,
              borderRadius: 10,
            }}
          >
            Belum ada dokumen. Tambahkan lewat form di atas.
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {docs.map((d) => {
            const isOpen = openDoc === d.id;
            return (
              <div
                key={d.id}
                style={{
                  border: `1px solid ${isOpen ? brown : line}`,
                  borderRadius: 10,
                  padding: "16px 18px",
                  background: d.active ? "#fff" : "#FAF8F5",
                  opacity: d.active ? 1 : 0.85,
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenDoc(isOpen ? null : d.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenDoc(isOpen ? null : d.id);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <strong style={{ color: ink, fontSize: 15 }}>{d.title}</strong>
                    {d.category && <Badge>{d.category}</Badge>}
                    <Badge tone={d.active ? "ok" : "off"}>{d.active ? "Aktif" : "Nonaktif"}</Badge>
                    <span style={{ color: muted, fontSize: 12, marginLeft: "auto" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: muted,
                      lineHeight: 1.6,
                      marginBottom: 14,
                      whiteSpace: isOpen ? "pre-wrap" : "normal",
                    }}
                  >
                    {isOpen ? d.content : d.content.length > 220 ? `${d.content.slice(0, 220)}...` : d.content}
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button type="button" style={outlineBtn} onClick={() => startEdit(d)}>
                    Ubah
                  </button>
                  <button type="button" style={outlineBtn} onClick={() => toggleActive(d)}>
                    {d.active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button type="button" style={dangerBtn} onClick={() => remove(d)}>
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}