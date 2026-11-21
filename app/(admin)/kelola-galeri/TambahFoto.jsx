"use client";

import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";

const FIELDS = [
  { name: "title", label: "Judul", required: true },
  { name: "caption", label: "Keterangan", type: "textarea", rows: 3 },
  { name: "image", label: "Foto", type: "image", required: true },
];

/**
 * Form tambah / edit foto galeri.
 * editing: null (tertutup) | "new" (tambah) | objek foto (edit)
 */
export default function TambahFoto({ editing, onClose, onSaved }) {
  const toast = useToast();

  async function simpan(values) {
    if (editing === "new") {
      await api("/gallery", { method: "POST", body: values });
      toast("Foto ditambahkan.");
    } else if (editing) {
      await api(`/gallery/${editing.id}`, { method: "PATCH", body: values });
      toast("Foto diperbarui.");
    }
    onClose();
    onSaved();
  }

  if (!editing) return null;

  return (
    <FormModal
      title={editing === "new" ? "Tambah foto" : "Edit foto"}
      fields={FIELDS}
      initial={editing === "new" ? {} : editing}
      onSubmit={simpan}
      onClose={onClose}
    />
  );
}