// Klien API tipis untuk backend Express Asmorobangun.
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api").replace(/\/$/, "");
const ORIGIN = API_BASE.replace(/\/api$/, "");

const TOKEN_KEY = "asmoro_admin_token";
const USER_KEY = "asmoro_admin_user";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdmin(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AdminUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

interface Options {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  form?: FormData;
}

export async function api<T = any>(path: string, { method = "GET", body, form }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!form && body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: form ? form : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Tidak bisa terhubung ke server. Pastikan backend sudah jalan.", 0);
  }

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    // Sesi habis: kembali ke halaman login (kecuali sedang di halaman login).
    if (res.status === 401 && token && typeof window !== "undefined" && !location.pathname.startsWith("/login")) {
      clearSession();
      location.href = "/login";
    }
    throw new ApiError(data.error || "Terjadi kesalahan. Coba lagi.", res.status);
  }
  return data as T;
}

/** URL lengkap untuk file hasil upload (/uploads/...). */
export function fileUrl(path?: string | null): string {
  if (!path) return "";
  if (/^(https?:|data:)/.test(path)) return path;
  return ORIGIN + path;
}

/**
 * Field "image" bisa berupa URL penuh, path /uploads/..., atau nama file lama
 * (data seed) yang dulu ada di frontend-app/assets dan masih dilayani backend di /app/assets.
 */
export function assetUrl(image?: string | null): string {
  if (!image) return "";
  if (/^(https?:|data:)/.test(image) || image.startsWith("/uploads")) return fileUrl(image);
  return `${ORIGIN}/app/assets/${image}`;
}
