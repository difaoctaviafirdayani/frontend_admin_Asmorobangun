"use client";
import { useState } from "react";
import { formatRupiah, truncate } from "@/lib/format";
import { api, assetUrl } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";
import { TopengForm, type TopengData } from "@/components/TopengForm";

const TH = { padding: "16px 20px", fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px" } as const;

export default function KelolaTopengPage() {
  const toast = useToast();
  const { data, error, reload } = useLoad(() => api<{ topeng: TopengData[] }>("/topeng"));
  const topengList: TopengData[] = data?.topeng || [];
  const [editing, setEditing] = useState<TopengData | "new" | null>(null);

  async function hapus(row: TopengData) {
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

      <div style={{ backgroundColor: "#FDFCEA", border: "1.5px solid #D4BBA5", borderRadius: "12px", overflow: "hidden" }}>
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
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#EADCCB",
                        borderRadius: "6px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#7A6A5A",
                        fontSize: "12px",
                      }}
                    >
                      {row.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={assetUrl(row.image)}
                          alt={row.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                      ) : (
                        "-"
                      )}
                    </div>
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
        <Modal title={editing === "new" ? "Tambah topeng" : "Edit topeng"} onClose={() => setEditing(null)}>
          <TopengForm
            key={editing === "new" ? "new" : editing.id}
            topeng={editing === "new" ? null : editing}
            onSuccess={() => {
              setEditing(null);
              reload();
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}