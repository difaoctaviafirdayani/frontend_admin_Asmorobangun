import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/api";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

// POST /api/session  { token }
// Dipanggil setelah login berhasil. Token diverifikasi ke backend dulu,
// baru disimpan ke cookie httpOnly (tidak bisa dibaca JavaScript di browser).
export async function POST(req: Request) {
  let token = "";
  try {
    token = String((await req.json())?.token || "");
  } catch {
    token = "";
  }
  if (!token) {
    return NextResponse.json({ error: "Token wajib diisi." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Tidak bisa terhubung ke server backend." }, { status: 502 });
  }
  if (!res.ok) {
    return NextResponse.json({ error: "Token tidak valid." }, { status: 401 });
  }
  const data = await res.json().catch(() => ({}));
  if (data?.user?.role !== "admin") {
    return NextResponse.json({ error: "Akun ini bukan admin sanggar." }, { status: 403 });
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return NextResponse.json({ ok: true });
}

// DELETE /api/session  -> hapus cookie sesi (dipakai saat logout)
export async function DELETE() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}