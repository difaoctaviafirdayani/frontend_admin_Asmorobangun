import "server-only";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

export async function serverApi(
  path: string,
  { method = "GET", body }: { method?: string; body?: unknown } = {}
): Promise<{ ok: boolean; status: number; data: any }> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Tidak bisa terhubung ke server backend." } };
  }
}