"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AdminUser, clearSession, getAdmin, getToken } from "@/lib/api";

const MENU = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pendaftar", label: "Pendaftar & Booking" },
  { href: "/pesanan-topeng", label: "Pesanan Topeng" },
  { href: "/kelola-kelas", label: "Kelola Kelas/Fasilitas" },
  { href: "/kelola-topeng", label: "Kelola Topeng" },
  { href: "/kelola-galeri", label: "Kelola Galeri" },
  { href: "/kelola-edukasi", label: "Kelola Edukasi" },
  { href: "/kelola-artikel", label: "Kelola Artikel" },
  { href: "/kelola-pengumuman", label: "Kelola Pengumuman" },
  { href: "/kelola-forum", label: "Kelola Forum" },
  { href: "/pengaturan-pembayaran", label: "Pengaturan Pembayaran" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

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

  useEffect(() => setOpen(false), [pathname]);

  if (!ready) return <div className="a-empty">Memuat...</div>;

  const current = MENU.find((m) => pathname.startsWith(m.href));

  return (
    <>
      <div className={`a-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`a-sidebar${open ? " open" : ""}`}>
        <div className="a-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-gold.png" alt="Asmorobangun" />
          <span>admin</span>
        </div>
        <nav className="a-nav">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className={pathname.startsWith(m.href) ? "active" : ""}>
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="a-sidebar-foot">
          <div className="a-admin-chip">{admin?.email}</div>
          <button
            className="a-logout-btn"
            onClick={() => {
              clearSession();
              router.replace("/login");
            }}
          >
            Keluar
          </button>
        </div>
      </aside>
      <div className="a-main">
        <header className="a-topbar">
          <button className="a-hamburger" aria-label="Menu" onClick={() => setOpen(true)}>
            ☰
          </button>
          <div className="a-topbar-title">{current?.label || "Admin"}</div>
        </header>
        <main className="a-content">{children}</main>
      </div>
    </>
  );
}
