"use client";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";

const FIELDS = [
  { name: "name", label: "Nama layanan", required: true },
  { name: "price", label: "Harga (Rp)", required: true, money: true },
  { name: "priceInfo", label: "Keterangan harga", placeholder: "Contoh: Rp 15.000 per orang" },
  { name: "shortDesc", label: "Deskripsi singkat", type: "textarea", rows: 3 },
  { name: "longDesc", label: "Deskripsi lengkap", type: "textarea", rows: 6 },
  { name: "image", label: "Foto layanan", type: "image" },
];

/**
 * Form tambah / edit layanan.
 * editing: null (tertutup) | "new" (tambah) | objek layanan (edit)
 */
export default function TambahLayanan({ editing, onClose, onSaved }) {
  const toast = useToast();

  async function simpan(values) {
    if (editing === "new") {
      await api("/facilities", { method: "POST", body: values });
      toast("Layanan ditambahkan.");
    } else if (editing) {
      await api(`/facilities/${editing.id}`, { method: "PATCH", body: values });
      toast("Layanan diperbarui.");
    }
    onClose();
    onSaved();
  }

  if (!editing) return null;

  return (
    <FormModal
      title={editing === "new" ? "Tambah layanan" : "Edit layanan"}
      fields={FIELDS}
      initial={editing === "new" ? {} : editing}
      onSubmit={simpan}
      onClose={onClose}
    />
  );
}