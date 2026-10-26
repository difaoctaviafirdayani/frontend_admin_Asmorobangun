import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Pagar KASAR: hanya cek cookie ada atau tidak, supaya redirect cepat.
// Pengecekan sebenarnya (token sah? role admin?) ada di lib/dal.ts.
export function proxy(request: NextRequest) {
  const hasCookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (!hasCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Semua halaman admin yang butuh login (/login dan /api sengaja tidak dimasukkan).
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pendaftar/:path*",
    "/pesanan-topeng/:path*",
    "/kelola-layanan/:path*",
    "/kelola-kelas/:path*",
    "/kelola-topeng/:path*",
    "/kelola-galeri/:path*",
    "/kelola-artikel/:path*",
    "/kelola-pengumuman/:path*",
    "/kelola-edukasi/:path*",
    "/kelola-forum/:path*",
    "/pengaturan-pembayaran/:path*",
  ],
};