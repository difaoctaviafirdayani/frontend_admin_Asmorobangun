"use client";
import { formatRupiah } from "@/lib/format";

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

export default function TabelLayanan({ list, onEdit }) {
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
              <th style={TH}>NAMA</th>
              <th style={TH}>HARGA</th>
              <th style={TH}>DESKRIPSI</th>
              <th style={{ ...TH, textAlign: "center" }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                <td style={{ padding: "16px 20px", fontWeight: "600", color: "#3A2A1A", verticalAlign: "middle" }}>
                  {row.name}
                </td>
                <td style={{ padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" }}>
                  {row.price ? formatRupiah(row.price) : "-"}
                  {row.priceText ? ` (${row.priceText})` : ""}
                </td>
                <td
                  style={{
                    padding: "16px 20px",
                    color: "#6A5A4A",
                    maxWidth: "350px",
                    verticalAlign: "middle",
                    lineHeight: "1.5",
                  }}
                >
                  {row.description}
                </td>
                <td style={{ padding: "16px 20px", textAlign: "center", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                    <button type="button" title="Detail" style={ICON_BTN}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </button>

                    <button type="button" onClick={() => onEdit(row)} title="Edit" style={ICON_BTN}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
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