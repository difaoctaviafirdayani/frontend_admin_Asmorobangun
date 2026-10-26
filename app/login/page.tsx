"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearSession, setSession, AdminUser } from "@/lib/api";
import { LoginSchema, validate } from "@/lib/schemas";

// Tujuan setelah login: halaman yang tadi dicoba dibuka (callbackUrl), atau /dashboard.
// Hanya path internal yang diterima (mencegah redirect ke situs lain).
function targetAfterLogin(): string {
  const raw = new URLSearchParams(window.location.search).get("callbackUrl") || "";
  const ok = raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/login");
  return ok ? raw : "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Validasi isian dengan Zod sebelum kirim ke backend
    const { state, data } = validate(LoginSchema, { email, password });
    if (!state.success || !data) {
      setError(Object.values(state.errors ?? {})[0]?.[0] ?? "Isian tidak valid.");
      return;
    }

    setBusy(true);
    try {
      const res = await api<{ token: string; user: AdminUser }>("/auth/login", {
        method: "POST",
        body: data,
      });
      if (res.user.role !== "admin") {
        clearSession();
        setError("Akun ini bukan admin sanggar.");
        return;
      }

      // 1) Cookie httpOnly untuk DAL & proxy (server). Diverifikasi ke backend dulu.
      const sess = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: res.token }),
      });
      if (!sess.ok) {
        const d = await sess.json().catch(() => ({}));
        setError(d.error || "Gagal membuat sesi login.");
        return;
      }

      // 2) Token untuk request API dari browser.
      setSession(res.token, res.user);
      router.replace(targetAfterLogin());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-login-wrap">
      <form className="a-card a-login-card" onSubmit={submit} noValidate>
        <div className="a-login-logo-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-gold.png" alt="Asmorobangun" style={{ margin: "0 auto" }} />
        </div>
        <h2>Masuk Admin</h2>
        <p>Dashboard pengelola Sanggar Asmorobangun</p>
        {error && <div className="a-error">{error}</div>}
        <div className="a-field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </div>
        <div className="a-field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="a-btn a-btn-primary" style={{ width: "100%" }} disabled={busy}>
          {busy ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}