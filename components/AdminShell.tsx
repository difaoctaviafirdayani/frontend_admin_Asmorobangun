"use client";

import React, { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAdmin, getToken, clearSession, AdminUser } from "@/lib/api";

interface AdminShellProps {
  children: ReactNode;
}

const menuGroups = [
  {
    title: "MENU",
    items: [{ name: "Beranda", href: "/dashboard" }],
  },
  {
    title: "TRANSAKSI",
    items: [
      { name: "Pendaftar & Booking", href: "/pendaftar" },
      { name: "Pesanan Topeng", href: "/pesanan-topeng" },
      { name: "Kelola Layanan", href: "/kelola-layanan" },
    ],
  },
  {
    title: "KONTEN",
    items: [
      { name: "Kelola Topeng", href: "/kelola-topeng" },
      { name: "Kelola Galeri", href: "/kelola-galeri" },
      { name: "Kelola Artikel", href: "/kelola-artikel" },
      { name: "Kelola Pengumuman", href: "/kelola-pengumuman" },
    ],
  },
  {
    title: "KOMUNITAS",
    items: [{ name: "Kelola Forum", href: "/kelola-forum" }],
  },
];

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  // Penjaga akses: harus punya token dan role admin.
  useEffect(() => {
    const u = getAdmin();
    if (!getToken() || !u || u.role !== "admin") {
      clearSession();
      router.replace("/login");
      return;
    }
    setAdmin(u);
    setReady(true);
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  if (!ready) {
    return <div className="a-empty">Memuat...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#FAF6ED",
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "280px",
          backgroundColor: "#FDFCEA",
          borderRight: "1px solid #E6D8C3",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "24px 20px",
          boxSizing: "border-box",
        }}
      >
        <div>
          {/* Menu Navigasi */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              marginTop: "8px",
            }}
          >
            {menuGroups.map((group) => (
              <div key={group.title}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#8C7A6B",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  {group.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {group.items.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: isActive ? "600" : "400",
                          color: "#3A2A1A",
                          backgroundColor: isActive ? "#EADBB8" : "transparent",
                          textDecoration: "none",
                          fontFamily: "var(--font-margarine), cursive, sans-serif",
                          transition: "background 0.2s",
                        }}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bagian Bawah: Profil & Logout */}
        <div
          style={{
            borderTop: "1px solid #E6D8C3",
            paddingTop: "16px",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#6B5B4F",
              marginBottom: "12px",
              wordBreak: "break-all",
            }}
          >
            {admin?.email}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #D4BBA5",
              backgroundColor: "transparent",
              color: "#3A2A1A",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px", backgroundColor: "#FAF6ED" }}>
        {children}
      </main>
    </div>
  );
}