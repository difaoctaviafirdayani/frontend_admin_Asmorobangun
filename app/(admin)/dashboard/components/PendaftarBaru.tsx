export interface Pendaftar {
  name: string;
  email: string;
  facility: string;
  date: string;
  status: string;
}

interface PendaftarBaruProps {
  data: Pendaftar[];
  formatDate: (iso: string) => string;
}

export default function PendaftarBaru({ data, formatDate }: PendaftarBaruProps) {
  return (
    <section className="m-recent">
      <div className="m-recent-head">
        <h2>Pendaftar Terbaru</h2>
        <a href="/pendaftar">Lihat semua</a>
      </div>

      <div className="m-table-box">
        <table className="m-table">
          <thead>
            <tr>
              <th>NAMA</th>
              <th>LAYANAN</th>
              <th>TANGGAL</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4}>Belum ada pendaftar.</td>
              </tr>
            ) : (
              data.map((r, i) => (
                <tr key={`${r.email}-${i}`}>
                  <td>{r.name}</td>
                  <td>{r.facility}</td>
                  <td>{formatDate(r.date)}</td>
                  <td>{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}