"use client";

import { useEffect, useState } from "react";
import { api, getAdmin } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";
import { BOOKING_STATUS } from "@/lib/format";

const Icon = ({ children }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const formatDate = (iso) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function DashboardPage() {
  const { data, loading, error } = useLoad(() => api("/admin/stats"));
  const [adminName, setAdminName] = useState("Admin");
  const [today, setToday] = useState("");

  useEffect(() => {
    const u = getAdmin();
    if (u?.name) setAdminName(u.name);
    setToday(new Date().toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }));
  }, []);

  if (loading) return <div className="a-empty">Memuat...</div>;
  if (error || !data) return <div className="a-empty">{error || "Gagal memuat."}</div>;

  const stats = [
    { label: "Total Pendaftar", value: data.totalPendaftar, icon: (<><circle cx="12" cy="7" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></>) },
    { label: "Menunggu Verifikasi", value: data.pendingReview, icon: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>) },
    { label: "Jadwal Bulan Ini", value: data.bookingsThisMonth, icon: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>) },
    { label: "Layanan Terpopuler", value: data.popularFacility, icon: (<><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 12h6M9 16h6" /></>) },
  ];

  const recent = data.recentRegistrants ?? [];

  return (
    <>
      <section className="m-hero">
        <h1>Sugeng Rawuh, {adminName}!</h1>
        <p>Statistik aktivitas pengguna bulan ini</p>
        <small>{today}</small>
      </section>

      <section className="m-stats">
        {stats.map((s) => (
          <div className="m-stat" key={s.label}>
            <Icon>{s.icon}</Icon>
            <b>{s.label}</b>
            <span>{s.value}</span>
          </div>
        ))}
      </section>

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
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={4}>Belum ada pendaftar.</td>
                </tr>
              ) : (
                recent.map((r, i) => (
                  <tr key={`${r.email}-${i}`}>
                    <td>{r.name}</td>
                    <td>{r.facility}</td>
                    <td>{formatDate(r.date)}</td>
                    <td>{BOOKING_STATUS[r.status] ?? r.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}