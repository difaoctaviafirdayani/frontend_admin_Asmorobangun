import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * @typedef {{
 *   id: string,
 *   email: string,
 *   name: string,
 *   role: "admin" | "member"
 * }} CurrentUser
 */

// Tanya backend: token ini milik siapa? (GET /auth/me)
/**
 * @param {string} token
 * @returns {Promise<CurrentUser | null>}
 */
async function fetchMe(token) {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });
    if (!res.ok) return null; // 401 = token palsu / kedaluwarsa / sudah logout
    const data = await res.json();
    const u = data?.user;
    if (!u) return null;
    return {
      id: String(u.id),
      email: String(u.email),
      name: String(u.name),
      role: u.role === "admin" ? "admin" : "member",
    };
  } catch {
    return null; // backend mati
  }
}

// Mengecek sesi TANPA redirect (berguna untuk halaman publik).
// React cache(): dipanggil berkali-kali dalam 1 render, backend hanya ditanya 1x.
export const getOptionalUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return fetchMe(token);
});

// Satu-satunya sumber kebenaran identitas user di server.
// Tidak login, atau bukan admin => langsung dialihkan ke /login dari server.
export const getCurrentUser = cache(async () => {
  const user = await getOptionalUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }
  return user;
});

/* ---------- MUTASI TOPENG lewat API Express ---------- */
// Identitas admin diambil dari token di cookie sesi (server), BUKAN dari form klien.
/**
 * @param {"POST" | "PATCH"} method
 * @param {string} path
 * @param {unknown} data
 */
async function callBackend(method, path, data) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) throw new Error("Sesi berakhir. Silakan login lagi.");

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });
  } catch {
    throw new Error("Tidak bisa terhubung ke backend. Pastikan backend dan MySQL sudah jalan.");
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Backend menolak data.");
  return json;
}

/** @param {import("@/lib/schemas").TopengInput} data */
export async function createTopeng(data) {
  return callBackend("POST", "/topeng", data);
}

/**
 * @param {string} id
 * @param {import("@/lib/schemas").TopengInput} data
 */
export async function updateTopeng(id, data) {
  return callBackend("PATCH", `/topeng/${encodeURIComponent(id)}`, data);
}