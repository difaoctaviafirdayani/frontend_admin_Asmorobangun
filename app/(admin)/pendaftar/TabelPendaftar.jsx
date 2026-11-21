import { BOOKING_STATUS, cancelInfo, formatDate, formatRupiah } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

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

export default function TabelPendaftar({
  rows,
  loading,
  error,
  onOpen,
}) {
  return (
    <div className="a-card a-card-cream">
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>NAMA</th>
              <th>LAYANAN</th>
              <th>TANGGAL</th>
              <th>NOMINAL</th>
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
                  Tidak ada data.
                </td>
              </tr>
            )}
            {rows.map((b) => (
              <tr key={b.id}>
                <td>{b.userName}</td>
                <td>{b.facilityName}</td>
                <td>
                  {b.date
                    ? /^\d{4}-\d{2}-\d{2}/.test(b.date)
                      ? formatDate(b.date)
                      : b.date
                    : "-"}
                </td>
                <td>{b.amount ? formatRupiah(b.amount) : "-"}</td>
                <td>
                  <StatusBadge status={b.status} labels={BOOKING_STATUS} />
                  {cancelInfo(b)?.byUser && <div className="a-info-sub">oleh pendaftar{cancelInfo(b).needsRefund ? " · perlu refund" : ""}</div>}
                </td>
                <td>
                  <div className="a-icons">
                    <button
                      className="a-icon-btn"
                      aria-label="Lihat detail"
                      title="Lihat detail"
                      onClick={() => onOpen(b, "info")}
                    >
                      <InfoIcon />
                    </button>
                    <button
                      className="a-icon-btn"
                      aria-label="Ubah status"
                      title="Ubah status"
                      onClick={() => onOpen(b, "edit")}
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