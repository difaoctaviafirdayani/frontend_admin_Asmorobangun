"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api, getToken, clearSession } from "@/lib/api";

const menuGroups = [
  {
    title: "DASHBOARD",
    items: [{ name: "Beranda", href: "/dashboard" }],
  },
  {
    title: "TRANSAKSI",
    items: [
      { name: "Pendaftar & Booking", href: "/pendaftar" },
      { name: "Pesanan Topeng", href: "/pesanan-topeng" },
    ],
  },
  {
    title: "ANALITIK",
    items: [{ name: "Diagram Statistik", href: "/statistik" }],
  },
  {
    title: "KONTEN",
    items: [
      { name: "Kelola Topeng", href: "/kelola-topeng" },
      { name: "Kelola Layanan", href: "/kelola-layanan" },
      { name: "Kelola Galeri", href: "/kelola-galeri" },
      { name: "Kelola Artikel", href: "/kelola-artikel" },
      { name: "Kelola Pengumuman", href: "/kelola-pengumuman" },
    ],
  },
  {
    title: "KOMUNITAS",
    items: [{ name: "Kelola Forum", href: "/kelola-forum" }],
  },
  {
    title: "AI",
    items: [{ name: "Dokumen Chatbot", href: "/kelola-chatbot" }],
  },
];

export default function AdminShell({ children, admin }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  async function endSession() {
    try {
      await fetch("/api/session", { method: "DELETE" });
    } catch {
      /* abaikan */
    }
    clearSession();
    router.replace("/login");
  }

  useEffect(() => {
    if (!getToken()) {
      void endSession();
      return;
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      /* tetap logout walau backend tidak terjangkau */
    }
    await endSession();
  };

  if (!ready) {
    return <div className="a-empty">Memuat...</div>;
  }

  return (
    <div className="m-shell">
      <div
        className={`m-overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`m-drawer ${open ? "open" : ""}`}>
        <div className="m-drawer-label">MENU</div>
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
          <div className="m-topbar-right" />
        </header>

        {children}
      </div>
    </div>
  );
}