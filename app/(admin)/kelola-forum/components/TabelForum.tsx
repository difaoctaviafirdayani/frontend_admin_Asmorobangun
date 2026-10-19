import { truncate } from "@/lib/format";

export interface ForumItem {
  id: string;
  topic: string;
  category: string;
  username: string;
  date: string;
}

interface TabelForumProps {
  rows: ForumItem[];
}

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export default function TabelForum({ rows }: TabelForumProps) {
  return (
    <div className="a-card a-card-cream">
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>TOPIK</th>
              <th>KATEGORI</th>
              <th>USERNAME</th>
              <th>TANGGAL</th>
              <th style={{ textAlign: "center" }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="a-empty">
                  Tidak ada data.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{truncate(row.topic, 50)}</td>
                <td>{row.category}</td>
                <td>{row.username}</td>
                <td>{row.date}</td>
                <td>
                  <div className="a-icons" style={{ justifyContent: "center" }}>
                    <button type="button" className="a-icon-btn" aria-label="Edit" title="Edit">
                      <EditIcon />
                    </button>
                    <button type="button" className="a-icon-btn" aria-label="Hapus" title="Hapus">
                      <DeleteIcon />
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