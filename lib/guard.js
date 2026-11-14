import "server-only";
import { getOptionalUser } from "@/lib/dal";

/**
 * @typedef {(
 *   | { ok: true, user: import("@/lib/dal").CurrentUser }
 *   | { ok: false, error: "UNAUTHENTICATED" | "FORBIDDEN", message: string }
 * )} GuardResult
 */

/** @returns {Promise<GuardResult>} */
export async function requireAdminInAction() {
  const user = await getOptionalUser();
  if (!user) {
    return { ok: false, error: "UNAUTHENTICATED", message: "Sesi habis. Silakan login ulang." };
  }
  if (user.role !== "admin") {
    return {
      ok: false,
      error: "FORBIDDEN",
      message: "FORBIDDEN: Tindakan ini hanya boleh dilakukan oleh Administrator.",
    };
  }
  return { ok: true, user };
}