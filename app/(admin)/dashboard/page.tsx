"use client";

import { ReactNode } from "react";
import { api } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";

interface Stats {
  totalPendaftar: number;
  bookingsThisMonth: number;
  ordersThisMonth: number;
  totalUsers: number;
  popularFacility: string;
  pendingReview: number;
  recentRegistrants: {
    name: string;
    email: string;
    facility: string;
    date: string;
    status: string;
  }[];
}

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export default function DashboardPage() {
  const { data, loading, error } = useLoad(() =>
    api<Stats>("/admin/stats")
  );

  if (loading) {
    return <div className="a-empty">Memuat...</div>;
  }

  if (error || !data) {
    return (
      <div className="a-empty">
        {error || "Gagal memuat."}
      </div>
    );
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const stats = [
    {
      label: "Total Pendaftar",
      value: "20",
      icon: (
        <>
          <circle cx="12" cy="7" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        </>
      ),
    },
    {
      label: "Menunggu Verifikasi",
      value: "5",
      icon: (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      ),
    },
    {
      label: "Jadwal Bulan Ini",
      value: "7",
      icon: (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </>
      ),
    },
    {
      label: "Layanan Terpopuler",
      value: "Kelas Tari",
      icon: (
        <>
          <rect x="6" y="4" width="12" height="17" rx="2" />
          <path d="M9 12h6M9 16h6" />
        </>
      ),
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="m-hero">
        <h1>Sugeng Rawuh, Admin!</h1>
        <p>Statistik aktivitas pengguna bulan ini</p>
        <small>{today}</small>
      </section>

      {/* STATISTIK */}
      <section className="m-stats">
        {stats.map((s) => (
          <div className="m-stat" key={s.label}>
            <Icon>{s.icon}</Icon>
            <b>{s.label}</b>
            <span>{s.value}</span>
          </div>
        ))}
      </section>

      {/* PENDAFTAR TERBARU */}
      <section className="m-recent">
        <div className="m-recent-head">
          <h2>Pendaftar Terbaru</h2>

          <a href="/pendaftar">
            Lihat semua
          </a>
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
              <tr>
                <td>Haechan</td>
                <td>Kelas Tari Wisata (Sekali Kunjungan)</td>
                <td>16/01/2026</td>
                <td>Belum diverifikasi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}