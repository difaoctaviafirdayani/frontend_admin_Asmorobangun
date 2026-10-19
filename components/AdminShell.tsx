"use client";

import React, { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAdmin, getToken, clearSession, AdminUser } from "@/lib/api";

interface AdminShellProps {
  children: ReactNode;
}

interface MenuItem {
  name: string;
  href: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
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
  const [ready, setReady] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

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

  // Tutup drawer otomatis tiap pindah halaman
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    router.replace("/login");
  };

  if (!ready) {
    return <div className="a-empty">Memuat...</div>;
  }

  return (
    <div className="m-shell">
      {/* Overlay gelap, klik buat nutup drawer */}
      <div
        className={`m-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar jadi drawer */}
      <aside className={`m-drawer ${open ? "open" : ""}`}>
        <nav>
          {menuGroups.map((group) => (
            <div className="m-group" key={group.title}>
              <div className="m-group-title">{group.title}</div>
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={isActive ? "active" : ""}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="m-drawer-foot">
          <div className="m-admin-email">{admin?.email}</div>
          <button type="button" className="m-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Konten utama */}
      <div className="m-content">
        <header className="m-topbar">
          <button
            type="button"
            className="m-burger"
            aria-label="Buka menu"
            onClick={() => setOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="m-logo">asmorobangun</div>
          <div className="m-burger-spacer" />
        </header>

        {children}
      </div>
    </div>
  );
}