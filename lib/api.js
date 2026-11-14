// Klien API tipis untuk backend Express Asmorobangun.
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api").replace(/\/$/, "");
const ORIGIN = API_BASE.replace(/\/api$/, "");

const TOKEN_KEY = "asmoro_admin_token";
const USER_KEY = "asmoro_admin_user";

/**
 * @typedef {{ id: string, name: string, email: string, role: string }} AdminUser
 * @typedef {{ message: string, status: number, path: string }} ApiErrorInfo
 * @typedef {{
 *   method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
 *   body?: unknown,
 *   form?: FormData
 * }} Options
 */

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Pengait notifikasi: dipasang oleh NotificationBell supaya setiap kegagalan API tampil di lonceng.
/** @type {((e: ApiErrorInfo) => void) | null} */
let errorHook = null;

/** @param {((e: ApiErrorInfo) => void) | null} fn */
export function setApiErrorHook(fn) {
  errorHook = fn;
}

/** @returns {string | null} */
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** @returns {AdminUser | null} */
export function getAdmin() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} token
 * @param {AdminUser} user
 */
export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * @param {string} path
 * @param {Options} [options]
 * @returns {Promise<any>}
 */
export async function api(path, { method = "GET", body, form } = {}) {
  // Supaya halaman peringatan ngrok (versi gratis) tidak ikut terkirim sebagai jawaban.
  const headers = { "ngrok-skip-browser-warning": "true" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!form && body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: form ? form : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new ApiError("Tidak bisa terhubung ke server. Pastikan backend sudah jalan.", 0);
    errorHook?.({ message: err.message, status: 0, path: `${method} ${path}` });
    throw err;
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    // Sesi habis: hapus cookie sesi server + data lokal, lalu kembali ke halaman login.
    if (res.status === 401 && token && typeof window !== "undefined" && !location.pathname.startsWith("/login")) {
      clearSession();
      fetch("/api/session", { method: "DELETE" }).finally(() => {
        location.href = "/login";
      });
    }
    const err = new ApiError(data.error || "Terjadi kesalahan. Coba lagi.", res.status);
    if (res.status !== 401) errorHook?.({ message: err.message, status: res.status, path: `${method} ${path}` });
    throw err;
  }
  return data;
}

/**
 * URL lengkap untuk file hasil upload (/uploads/...).
 * @param {string | null} [path]
 * @returns {string}
 */
export function fileUrl(path) {
  if (!path) return "";
  if (/^(https?:|data:)/.test(path)) return path;
  return ORIGIN + path;
}

/**
 * Field "image" bisa berupa URL penuh, path /uploads/..., atau nama file lama
 * (data seed) yang dulu ada di frontend-app/assets dan masih dilayani backend di /app/assets.
 * @param {string | null} [image]
 * @returns {string}
 */
export function assetUrl(image) {
  if (!image) return "";
  if (/^(https?:|data:)/.test(image) || image.startsWith("/uploads")) return fileUrl(image);
  return `${ORIGIN}/app/assets/${image}`;
}