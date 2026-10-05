"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearSession, getAdmin, getToken, setSession, AdminUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const u = getAdmin();
    if (getToken() && u?.role === "admin") router.replace("/dashboard");
  }, [router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api<{ token: string; user: AdminUser }>("/auth/login", { method: "POST", body: { email, password } });
      if (res.user.role !== "admin") {
        clearSession();
        setError("Akun ini bukan admin sanggar.");
        return;
      }
      setSession(res.token, res.user);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-login-wrap">
      <form className="a-card a-login-card" onSubmit={submit}>
        <div className="a-login-logo-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-gold.png" alt="Asmorobangun" style={{ margin: "0 auto" }} />
        </div>
        <h2>Masuk Admin</h2>
        <p>Dashboard pengelola Sanggar Asmorobangun</p>
        {error && <div className="a-error">{error}</div>}
        <div className="a-field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </div>
        <div className="a-field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="a-btn a-btn-primary" style={{ width: "100%" }} disabled={busy}>
          {busy ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
