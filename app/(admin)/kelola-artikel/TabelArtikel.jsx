"use client";
import { truncate, getErrorMessage } from "@/lib/format";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

const TH = { padding: "16px 20px", fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" };

const ICON_BTN = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  border: "1px solid #C4A482",
  background: "transparent",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#3A2A1A",
};

export default function TabelArtikel({ list, onEdit, onChanged }) {
  const toast = useToast();

  async function hapus(row) {
    if (!confirm(`Hapus artikel "${row.title}"?`)) return;
    try {
      await api(`/articles/${row.id}`, { method: "DELETE" });
      toast("Artikel dihapus.");
      onChanged();
    } catch (err) {
      toast(getErrorMessage(err));
    }
  }

  return (
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
              <th style={TH}>JUDUL</th>
              <th style={TH}>KATEGORI</th>
              <th style={TH}>TANGGAL</th>
              <th style={{ ...TH, textAlign: "center" }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                <td style={{ padding: "16px 20px", color: "#3A2A1A", verticalAlign: "middle", maxWidth: "380px", lineHeight: "1.5" }}>
                  {truncate(row.title, 80)}
                </td>
                <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>{row.category}</td>
                <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>{row.date}</td>
                <td style={{ padding: "16px 20px", textAlign: "center", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                    <button type="button" onClick={() => onEdit(row)} title="Edit" style={ICON_BTN}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>

                    <button type="button" onClick={() => hapus(row)} title="Hapus" style={ICON_BTN}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}