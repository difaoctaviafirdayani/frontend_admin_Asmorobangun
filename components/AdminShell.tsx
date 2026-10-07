"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AdminUser, clearSession, getAdmin, getToken } from "@/lib/api";

const GROUPS = [
  {
    title: "Dashboard",
    items: [{ href: "/dashboard", label: "Beranda" }],
  },
  {
    title: "Transaksi",
    items: [
      { href: "/pendaftar", label: "Pendaftar & Booking" },
      { href: "/pesanan-topeng", label: "Pesanan Topeng" },
      { href: "/kelola-kelas", label: "Kelola Layanan" },
    ],
  },
  {
    title: "Konten",
    items: [
      { href: "/kelola-topeng", label: "Kelola Topeng" },
      { href: "/kelola-galeri", label: "Kelola Galeri" },
      { href: "/kelola-artikel", label: "Kelola Artikel" },
      { href: "/kelola-pengumuman", label: "Kelola Pengumuman" },
    ],
  },
  {
    title: "Komunitas",
    items: [{ href: "/kelola-forum", label: "Kelola Forum" }],
  },
];

export default function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

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

  // Tutup sidebar ketika pindah halaman
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC untuk menutup sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!ready) {
    return <div className="a-empty">Memuat...</div>;
  }

  return (
    <div className="m-shell">
      {/* TOPBAR */}
      <header className="m-topbar">
        <button
          type="button"
          className={`m-burger${open ? " open" : ""}`}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className="m-logo">asmorobangun</div>

        <div className="m-burger-spacer" />
      </header>

      {/* OVERLAY / AREA MEMUDAR */}
      <div
        className={`m-overlay${open ? " open" : ""}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      {/* SIDEBAR */}
      <aside
        className={`m-drawer${open ? " open" : ""}`}
        aria-hidden={!open}
      >
        <div className="m-drawer-label">MENU</div>

        <nav>
          {GROUPS.map((group) => (
            <div key={group.title} className="m-group">
              <div className="m-group-title">
                {group.title.toUpperCase()}
              </div>

              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    pathname.startsWith(item.href) ? "active" : ""
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="m-drawer-foot">
          <div className="m-admin-email">{admin?.email}</div>

          <button
            type="button"
            className="m-logout"
            onClick={() => {
              clearSession();
              router.replace("/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="m-content">{children}</main>
    </div>
  );
}