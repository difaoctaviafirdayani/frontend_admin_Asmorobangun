import "server-only";
import { getOptionalUser, type CurrentUser } from "@/lib/dal";

export type GuardResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; error: "UNAUTHENTICATED" | "FORBIDDEN"; message: string };

export async function requireAdminInAction(): Promise<GuardResult> {
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