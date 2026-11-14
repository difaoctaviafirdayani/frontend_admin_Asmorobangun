import "server-only";
import { getOptionalUser } from "@/lib/dal";

/**
 * @typedef {{ id: string, role: string, name?: string, email?: string }} GuardUser
 *
 * @typedef {(
 *   | { ok: true, user: GuardUser }
 *   | { ok: false, error: "UNAUTHENTICATED" | "FORBIDDEN", message: string }
 * )} GuardResult
 */

// Dipakai DI DALAM Server Action. Berbeda dengan getCurrentUser() yang mengalihkan
// ke /login, fungsi ini mengembalikan hasil supaya action bisa membalas dengan pesan.
/** @returns {Promise<GuardResult>} */
export async function requireAdminInAction() {
  const user = await getOptionalUser();

  if (!user) {
    return { ok: false, error: "UNAUTHENTICATED", message: "Sesi berakhir. Silakan login lagi." };
  }
  if (user.role !== "admin") {
    return { ok: false, error: "FORBIDDEN", message: "Kamu tidak punya akses untuk aksi ini." };
  }
  return { ok: true, user };
}