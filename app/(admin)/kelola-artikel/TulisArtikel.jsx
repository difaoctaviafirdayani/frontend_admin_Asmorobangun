"use client";
import { KATEGORI_ARTIKEL } from "@/lib/artikel";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";

const FIELDS = [
  { name: "title", label: "Judul", required: true },
  {
    name: "category",
    label: "Kategori",
    type: "select",
    options: KATEGORI_ARTIKEL.map((c) => ({ value: c, label: c })),
  },
  { name: "excerpt", label: "Ringkasan", type: "textarea", rows: 2, hint: "Kosongkan untuk diambil otomatis dari isi artikel." },
  { name: "content", label: "Isi artikel", type: "textarea", rows: 8, required: true },
  { name: "image", label: "Gambar sampul", type: "image" },
];

/**
 * Form tulis / edit artikel.
 * editing: null (tertutup) | "new" (tulis baru) | objek artikel (edit)
 */
export default function TulisArtikel({ editing, onClose, onSaved }) {
  const toast = useToast();

  async function simpan(values) {
    if (editing === "new") {
      await api("/articles", { method: "POST", body: values });
      toast("Artikel ditambahkan.");
    } else if (editing) {
      await api(`/articles/${editing.id}`, { method: "PATCH", body: values });
      toast("Artikel diperbarui.");
    }
    onClose();
    onSaved();
  }

  if (!editing) return null;

  return (
    <FormModal
      title={editing === "new" ? "Tulis artikel" : "Edit artikel"}
      fields={FIELDS}
      initial={editing === "new" ? { category: "Budaya" } : editing}
      onSubmit={simpan}
      onClose={onClose}
    />
  );
}