// Aman diimpor dari server maupun browser.
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/api").replace(/\/$/, "");
export const ORIGIN = API_BASE.replace(/\/api$/, "");