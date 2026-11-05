"use client";
import type { Topeng } from "@/types/topeng";
import { useState } from "react";
import { formatRupiah, truncate } from "@/lib/format";
import { api, assetUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { useToast } from "@/components/Toast";
import FormModal from "@/components/FormModal";
import ResultPopup from "@/components/ResultPopup";
import type { FieldDef } from "@/types/crud";

const TH = { padding: "16px 20px", fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px" } as const;

const FIELDS: FieldDef[] = [
  { name: "name", label: "Nama topeng", required: true },
  { name: "character", label: "Karakter / watak" },
  { name: "color", label: "Warna" },
  { name: "price", label: "Harga (Rp)", type: "number", required: true },
  { name: "desc", label: "Deskripsi", type: "textarea", rows: 4 },
  { name: "image", label: "Foto topeng", type: "image" },
];

const MIN_HARGA = 1000;
const MAX_HARGA = 10000000;

function Thumb({ src, alt }: { src?: string | null; alt: string }) {
  const [gagalMuat, setGagalMuat] = useState(false);
  const url = assetUrl(src);

  if (!url || gagalMuat) {
    return (
      <div
        style={{
          width: "40px",
          height: "40px",
          backgroundColor: "#EADCCB",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7A6A5A",
          fontSize: "12px",
        }}
      >
        -
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      onError={() => setGagalMuat(true)}
      style={{
        width: "40px",
        height: "40px",
        objectFit: "cover",
        borderRadius: "6px",
        border: "1px solid #D4BBA5",
        display: "block",
      }}
    />
  );
}

type PopupState = { type: "success" | "error"; title: string; message: string } | null;

export default function KelolaTopengPage() {
  const toast = useToast();
  const { data, error, reload } = useLoad(() => api<{ topeng: Topeng[] }>("/topeng"));
  const topengList: Topeng[] = data?.topeng || [];
  const [editing, setEditing] = useState<Topeng | "new" | null>(null);
  const [popup, setPopup] = useState<PopupState>(null);

  function gagal(message: string) {
    setPopup({ type: "error", title: "Gagal menyimpan", message });
  }

  async function simpan(values: Record<string, any>) {
    const name = String(values.name || "").trim();
    const price = Number(values.price);

    if (name.length < 3) {
      gagal("Nama topeng minimal 3 karakter.");
      return;
    }
    if (values.price === "" || values.price == null) {
      gagal("Harga wajib diisi.");
      return;
    }
    if (!Number.isInteger(price) || price < MIN_HARGA || price > MAX_HARGA) {
      gagal(`Harga harus berupa angka bulat (tanpa koma) antara ${formatRupiah(MIN_HARGA)} dan ${formatRupiah(MAX_HARGA)}.`);
      return;
    }

    const body = { ...values, name, price };
    const baru = editing === "new";
    try {
      if (baru) {
        await api("/topeng", { method: "POST", body });
      } else if (editing) {
        await api(`/topeng/${editing.id}`, { method: "PATCH", body });
      }
      setEditing(null);
      reload();
      setPopup({
        type: "success",
        title: "Berhasil!",
        message: baru
          ? `Topeng "${name}" berhasil ditambahkan.`
          : `Topeng "${name}" berhasil diperbarui.`,
      });
    } catch (err: any) {
      gagal(err?.message || "Terjadi kesalahan saat menyimpan data.");
    }
  }

  async function hapus(row: Topeng) {
    if (!confirm(`Hapus topeng "${row.name}"?`)) return;
    try {
      await api(`/topeng/${row.id}`, { method: "DELETE" });
      toast("Topeng dihapus.");
      reload();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Gagal menghapus topeng.");
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "100%", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "normal",
          color: "#3A2A1A",
          marginBottom: "16px",
          fontFamily: "'Margarine', cursive, sans-serif",
        }}
      >
        Kelola Topeng
      </h1>

      {error && <div style={{ color: "#A84C4C", marginBottom: "12px", fontSize: "14px" }}>{error}</div>}

      <div style={{ marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setEditing("new")}
          style={{
            backgroundColor: "#5A3E2B",
            color: "#FFFFFF",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span> Tambah topeng
        </button>
      </div>

      <div
        style={{
          backgroundColor: "#FDFCEA",
          border: "1.5px solid #D4BBA5",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #D4BBA5", color: "#3A2A1A" }}>
                <th style={TH}>Gambar</th>
                <th style={TH}>Nama</th>
                <th style={TH}>Karakter</th>
                <th style={TH}>Harga</th>
                <th style={{ ...TH, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {topengList.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "24px 20px", color: "#7A6A5A", textAlign: "center" }}>
                    Belum ada topeng.
                  </td>
                </tr>
              )}
              {topengList.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                  <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                    <Thumb src={row.image} alt={row.name} />
                  </td>
                  <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                    <strong style={{ color: "#3A2A1A", display: "block" }}>{row.name}</strong>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#7A6A5A", verticalAlign: "middle", maxWidth: "300px" }}>
                    {truncate(row.character, 50)}
                  </td>
                  <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                    {formatRupiah(row.price)}
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        style={{
                          backgroundColor: "#E6DCC9",
                          color: "#3A2A1A",
                          border: "1px solid #C4A482",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(row)}
                        style={{
                          backgroundColor: "#A84C4C",
                          color: "#FFFFFF",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <FormModal
          title={editing === "new" ? "Tambah topeng" : "Edit topeng"}
          fields={FIELDS}
          initial={editing === "new" ? {} : (editing as any)}
          onSubmit={simpan}
          onClose={() => setEditing(null)}
        />
      )}

      {popup && (
        <ResultPopup
          type={popup.type}
          title={popup.title}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}