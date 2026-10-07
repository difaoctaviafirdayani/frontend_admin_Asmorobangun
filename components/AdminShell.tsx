"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AdminUser, clearSession, getAdmin, getToken } from "@/lib/api";

const GROUPS = [
  { title: "Dashboard", items: [{ href: "/dashboard", label: "Beranda" }] },
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
  { title: "Komunitas", items: [{ href: "/kelola-forum", label: "Kelola Forum" }] },
];

export default function AdminShell({ children }: { children: ReactNode }) {
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

  useEffect(() => setOpen(false), [pathname]);

  if (!ready) return <div className="a-empty">Memuat...</div>;

  return (
    <div className="m-shell">
      <header className="m-topbar">
        <button className="m-burger" aria-label="Menu" onClick={() => setOpen(true)}>
          <span /><span /><span />
        </button>
        <div className="m-logo">asmorobangun</div>
        <div className="m-burger-spacer" />
      </header>

      <div className={`m-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`m-drawer${open ? " open" : ""}`}>
        <div className="m-drawer-label">MENU</div>
        <nav>
          {GROUPS.map((g) => (
            <div key={g.title} className="m-group">
              <div className="m-group-title">{g.title.toUpperCase()}</div>
              {g.items.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className={pathname.startsWith(m.href) ? "active" : ""}
                >
                  {m.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="m-drawer-foot">
          <div className="m-admin-email">{admin?.email}</div>
          <button
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

      <main className="m-content">{children}</main>
    </div>
  );
}