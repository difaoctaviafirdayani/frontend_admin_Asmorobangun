"use client";
import { CSSProperties, useEffect, useState } from "react";
import { api, assetUrl, getAdmin } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { BOOKING_STATUS, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

interface Stats {
  totalPendaftar: number;
  bookingsThisMonth: number;
  ordersThisMonth: number;
  totalUsers: number;
  newUsersThisMonth?: number;
  forumThreadsThisMonth?: number;
  popularFacility: string;
  pendingReview: number;
  recentRegistrants: { name: string; email: string; facility: string; date: string; status: string }[];
}

// Gambar banner diambil dari backend (public/assets). Ganti nama file kalau mau gambar lain,
// atau pakai "/nama-gambar.jpg" dari folder public admin.
const BANNER_IMAGE = assetUrl("kunjungan-edukasi.png");

export default function DashboardPage() {
  const { data, loading, error } = useLoad(() => api<Stats>("/admin/stats"));
  const [adminName, setAdminName] = useState("Admin Sanggar");
  const [today, setToday] = useState("");

  // Diisi setelah halaman tampil di browser supaya tidak bentrok dengan render server.
  useEffect(() => {
    const u = getAdmin();
    if (u?.name) setAdminName(u.name);
    setToday(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const banner = (
    <section
      className="a-banner"
      style={{ "--banner-img": BANNER_IMAGE ? `url("${BANNER_IMAGE}")` : "none" } as CSSProperties}
    >
      <h2 className="a-banner-title">Sugeng Rawuh, {adminName}!</h2>
      <p className="a-banner-sub">Statistik aktivitas pengguna bulan ini</p>
      <p className="a-banner-date">{today}</p>
    </section>
  );

  if (loading) return <>{banner}<div className="a-empty">Memuat...</div></>;
  if (error || !data) return <>{banner}<div className="a-empty">{error || "Gagal memuat."}</div></>;

  const cards: [string, string | number, boolean?][] = [
    ["Total pendaftar & pesanan", data.totalPendaftar],
    ["Booking bulan ini", data.bookingsThisMonth],
    ["Pesanan topeng bulan ini", data.ordersThisMonth],
    ["Menunggu verifikasi", data.pendingReview],
    ["Total pengguna", data.totalUsers],
    ["Pengguna baru bulan ini", data.newUsersThisMonth ?? 0],
    ["Diskusi forum bulan ini", data.forumThreadsThisMonth ?? 0],
    ["Layanan terpopuler", data.popularFacility, true],
  ];

  return (
    <>
      {banner}

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