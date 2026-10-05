"use client";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { BOOKING_STATUS, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

interface Stats {
  totalPendaftar: number;
  bookingsThisMonth: number;
  ordersThisMonth: number;
  totalUsers: number;
  popularFacility: string;
  pendingReview: number;
  recentRegistrants: { name: string; email: string; facility: string; date: string; status: string }[];
}

export default function DashboardPage() {
  const { data, loading, error } = useLoad(() => api<Stats>("/admin/stats"));
  if (loading) return <div className="a-empty">Memuat...</div>;
  if (error || !data) return <div className="a-empty">{error || "Gagal memuat."}</div>;

  const cards: [string, string | number, boolean?][] = [
    ["Total pendaftar & pesanan", data.totalPendaftar],
    ["Booking bulan ini", data.bookingsThisMonth],
    ["Pesanan topeng bulan ini", data.ordersThisMonth],
    ["Menunggu verifikasi", data.pendingReview],
    ["Total pengguna", data.totalUsers],
    ["Layanan terpopuler", data.popularFacility, true],
  ];

  return (
    <>
      <div className="a-stats">
        {cards.map(([label, value, small]) => (
          <div className="a-card a-stat" key={label}>
            <div className="label">{label}</div>
            <div className={`value${small ? " small" : ""}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="a-card">
        <div className="a-card-pad" style={{ paddingBottom: 6 }}>
          <h3>Pendaftar terbaru</h3>
        </div>
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr><th>Nama</th><th>Layanan</th><th>Tanggal</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.recentRegistrants.length === 0 && <tr><td colSpan={4} className="a-empty">Belum ada pendaftar.</td></tr>}
              {data.recentRegistrants.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}<div className="a-muted">{r.email}</div></td>
                  <td>{r.facility}</td>
                  <td>{formatDate(r.date)}</td>
                  <td><StatusBadge status={r.status} labels={BOOKING_STATUS} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
