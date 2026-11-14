import { truncate } from "@/lib/format";

const TH = {
  padding: "16px 20px",
  fontWeight: "700",
  fontSize: "14px",
  letterSpacing: "0.5px",
};

const TD = { padding: "16px 20px", color: "#5A4A3A", verticalAlign: "middle" };

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

export default function TabelForum({ rows, onEdit, onHapus }) {
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
              <th style={TH}>TOPIK</th>
              <th style={TH}>KATEGORI</th>
              <th style={TH}>USERNAME</th>
              <th style={TH}>TANGGAL</th>
              <th style={{ ...TH, textAlign: "center" }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "24px 20px", color: "#7A6A5A", textAlign: "center" }}>
                  Belum ada diskusi.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #E6D8C3" }}>
                <td style={{ ...TD, color: "#3A2A1A", maxWidth: "250px" }}>
                  {truncate(row.topic, 50)}
                </td>
                <td style={TD}>{row.category}</td>
                <td style={TD}>{row.username}</td>
                <td style={TD}>{row.date}</td>
                <td style={{ ...TD, textAlign: "center" }}>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                    <button type="button" onClick={() => onEdit(row)} title="Edit" style={ICON_BTN}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>

                    <button type="button" onClick={() => onHapus(row)} title="Hapus" style={ICON_BTN}>
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