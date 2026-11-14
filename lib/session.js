// Nama & umur cookie sesi. Dipisah dari dal.js supaya bisa dipakai juga oleh proxy.js
// (dal.js memakai "server-only").
export const SESSION_COOKIE = "asmoro_admin_token";

// 7 hari, sama dengan JWT_EXPIRES_IN di backend.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;