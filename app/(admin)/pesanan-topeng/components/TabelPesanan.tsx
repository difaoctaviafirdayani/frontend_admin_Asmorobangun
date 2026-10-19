import { ORDER_STATUS } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export interface Order {
  id: string;
  topengName: string;
  topengImage: string;
  userName: string;
  buyerPhone: string;
  qty: number;
  unitPrice: number | string;
  total: number;
  customName: string | null;
  customDesign: string | null;
  message: string;
  paymentMethod: string | null;
  proofFile: string | null;
  status: string;
  createdAt: string;
  chatLog: { from: string; text: string; date: string }[];
}

interface TabelPesananProps {
  rows: Order[];
  loading: boolean;
  error: string | null | undefined;
  onOpen: (o: Order) => void;
}

// Figma menampilkan tanggal sebagai dd/mm/yyyy
function tanggal(value: string) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    </svg>
  );
}

export default function TabelPesanan({ rows, loading, error, onOpen }: TabelPesananProps) {
  return (
    <div className="a-card a-card-cream">
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>NAMA</th>
              <th>TOPENG</th>
              <th style={{ textAlign: "center" }}>JUMLAH</th>
              <th>TANGGAL</th>
              <th>STATUS</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6}>Memuat...</td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={6} className="a-empty">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="a-empty">
                  Tidak ada pesanan.
                </td>
              </tr>
            )}
            {rows.map((o) => (
              <tr key={o.id}>
                <td>{o.userName}</td>
                <td>{o.topengName}</td>
                <td style={{ textAlign: "center" }}>{o.qty}</td>
                <td>{tanggal(o.createdAt)}</td>
                <td>
                  <StatusBadge status={o.status} labels={ORDER_STATUS} />
                </td>
                <td>
                  <div className="a-icons">
                    <button
                      className="a-icon-btn"
                      aria-label="Lihat detail"
                      title="Lihat detail"
                      onClick={() => onOpen(o)}
                    >
                      <InfoIcon />
                    </button>
                    <button
                      className="a-icon-btn"
                      aria-label="Ubah status"
                      title="Ubah status"
                      onClick={() => onOpen(o)}
                    >
                      <EditIcon />
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