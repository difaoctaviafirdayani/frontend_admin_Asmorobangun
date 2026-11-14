"use client";
import { useState } from "react";
import { formatDate } from "@/lib/format";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { useToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";
import FilterForum from "./components/FilterForum";
import TabelForum from "./components/TabelForum";

const FIELDS = [
  { name: "title", label: "Judul", required: true },
  { name: "category", label: "Kategori" },
  { name: "content", label: "Isi diskusi", type: "textarea", rows: 6, required: true },
];

export default function KelolaForumPage() {
  const toast = useToast();
  const { data, error, reload } = useLoad(() => api("/forum"));
  const forumList = (data?.threads || []).map((t) => ({
    id: t.id,
    topic: t.title,
    category: t.category,
    username: t.userName,
    date: formatDate(t.date),
  }));

  const [editing, setEditing] = useState(null);
  const [fKategori, setFKategori] = useState("");

  const categories = Array.from(
    new Set(forumList.map((r) => r.category).filter(Boolean))
  );
  const tampil = fKategori
    ? forumList.filter((r) => r.category === fKategori)
    : forumList;

  // ambil isi lengkap diskusi dulu (daftar hanya berisi ringkasan)
  async function bukaEdit(row) {
    try {
      const res = await api(`/forum/${row.id}`);
      setEditing(res.thread);
    } catch (err) {
      toast(err.message);
    }
  }

  async function simpan(values) {
    if (!editing) return;
    await api(`/forum/${editing.id}`, { method: "PATCH", body: values });
    toast("Diskusi diperbarui.");
    setEditing(null);
    reload();
  }

  async function hapus(row) {
    if (!confirm(`Hapus diskusi "${row.topic}" beserta semua balasannya?`)) return;
    try {
      await api(`/forum/${row.id}`, { method: "DELETE" });
      toast("Diskusi dihapus.");
      reload();
    } catch (err) {
      toast(err.message);
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "100%", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "normal",
          color: "#3A2A1A",
          marginBottom: "12px",
          fontFamily: "'Margarine', cursive, sans-serif",
        }}
      >
        Kelola Forum
      </h1>

      {error && <div style={{ color: "#A84C4C", marginBottom: "12px", fontSize: "14px" }}>{error}</div>}

      {editing && (
        <FormModal
          title="Moderasi diskusi"
          fields={FIELDS}
          initial={editing}
          onSubmit={simpan}
          onClose={() => setEditing(null)}
        />
      )}

      <FilterForum
        categories={categories}
        fKategori={fKategori}
        onKategoriChange={setFKategori}
      />

      <TabelForum rows={tampil} onEdit={bukaEdit} onHapus={hapus} />
    </div>
  );
}