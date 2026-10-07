"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AdminUser, clearSession, getAdmin, getToken } from "@/lib/api";

// Menu dikelompokkan. Menu "Pengaturan Pembayaran" sudah dihapus dari sidebar.
const GROUPS: { title?: string; items: { href: string; label: string }[] }[] = [
  { items: [{ href: "/dashboard", label: "Dashboard" }] },
  {
    title: "Registrasi",
    items: [
      { href: "/pendaftar", label: "Pendaftar & Booking" },
      { href: "/pesanan-topeng", label: "Pesanan Topeng" },
    ],
  },
  {
    title: "Layanan",
    items: [
      { href: "/kelola-kelas", label: "Kelola Kelas/Fasilitas" },
      { href: "/kelola-topeng", label: "Kelola Topeng" },
    ],
  },
  {
    title: "Informasi",
    items: [
      { href: "/kelola-galeri", label: "Kelola Galeri" },
      { href: "/kelola-edukasi", label: "Kelola Edukasi" },
      { href: "/kelola-artikel", label: "Kelola Artikel" },
      { href: "/kelola-pengumuman", label: "Kelola Pengumuman" },
    ],
  },
  {
    title: "Komunitas",
    items: [{ href: "/kelola-forum", label: "Kelola Forum" }],
  },
];

const ALL_ITEMS = GROUPS.flatMap((g) => g.items);

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

  // Tombol Esc menutup sidebar di HP
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ready) return <div className="a-empty">Memuat...</div>;

  const current = ALL_ITEMS.find((m) => pathname.startsWith(m.href));

  return (
    <>
      <div className={`a-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`a-sidebar${open ? " open" : ""}`}>
        <div className="a-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-gold.png" alt="Asmorobangun" />
        </div>
        <nav className="a-nav" aria-label="Menu admin">
          {GROUPS.map((g, i) => (
            <div className="a-nav-group" key={g.title || i}>
              {g.title && <div className="a-nav-title">{g.title}</div>}
              {g.items.map((m) => {
                const active = pathname.startsWith(m.href);
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    className={active ? "active" : ""}
                    aria-current={active ? "page" : undefined}
                  >
                    {m.label}
                  </Link>
                );
              })}
            </div>
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
          <button className="a-hamburger" aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen(true)}>
            ☰
          </button>
          <div className="a-topbar-title">{current?.label || "Admin"}</div>
        </header>
        <main className="a-content">{children}</main>
      </div>
    </>
  );
}