import { z } from "zod";

/* ---------- Helper kecil dipakai berulang ---------- */

// Teks wajib: dipotong spasi di ujung, minimal 1 karakter
const wajib = (label: string, min = 1, max = 255) =>
  z
    .string({
      required_error: `${label} wajib diisi.`,
      invalid_type_error: `${label} harus berupa teks.`,
    })
    .trim()
    .min(min, min === 1 ? `${label} wajib diisi.` : `${label} minimal ${min} karakter.`)
    .max(max, `${label} maksimal ${max} karakter.`);

// Teks boleh kosong (form kirim "" kalau tidak diisi)
const opsional = (max = 5000) => z.string().trim().max(max).optional().default("");

// Angka dari form selalu string -> pakai coerce
const angka = (label: string) =>
  z.coerce.number({ invalid_type_error: `${label} harus berupa angka.` });

/* ---------- Login admin (app/login/page.tsx) ---------- */
export const LoginSchema = z.object({
  email: wajib("Email").email("Format email tidak valid."),
  password: wajib("Password", 1, 64),
});

/* ---------- Topeng (kelola-topeng) ---------- */
export const TopengSchema = z.object({
  name: wajib("Nama topeng", 3, 120),
  character: opsional(255),
  price: angka("Harga").positive("Harga harus lebih dari 0."),
  stock: angka("Stok").int("Stok harus bilangan bulat.").min(0, "Stok tidak boleh negatif.").default(0),
  color: opsional(50),
  image: opsional(500),
  desc: opsional(2000),
});

/* ---------- Artikel (kelola-artikel) ---------- */
export const ArtikelSchema = z.object({
  title: wajib("Judul", 5, 200),
  category: wajib("Kategori", 1, 60).default("Berita"),
  excerpt: opsional(500),
  content: wajib("Isi artikel", 10, 20000),
  image: opsional(500),
});

/* ---------- Pengumuman (kelola-pengumuman) ---------- */
export const PengumumanSchema = z.object({
  title: wajib("Judul", 3, 200),
  body: wajib("Isi pengumuman", 3, 5000),
  type: wajib("Jenis", 1, 60).default("Pengumuman"),
  color: wajib("Warna", 1, 30).default("brown"),
  image: opsional(500),
});

/* ---------- Galeri (kelola-galeri) ---------- */
export const GaleriSchema = z.object({
  title: wajib("Judul", 3, 150),
  caption: opsional(500),
  image: wajib("Gambar"),
});

/* ---------- FAQ / Layanan ---------- */
export const FaqSchema = z.object({
  question: wajib("Pertanyaan", 5, 300),
  answer: wajib("Jawaban", 3, 3000),
});

/* ---------- Forum (kelola-forum, edit thread) ---------- */
export const ForumSchema = z.object({
  title: wajib("Judul", 3, 200),
  content: wajib("Isi", 3, 5000),
  category: wajib("Kategori", 1, 60),
});

/* ---------- Edukasi: poin linimasa (kelola-edukasi) ---------- */
export const TimelineSchema = z.object({
  year: wajib("Tahun / periode", 1, 50),
  text: wajib("Keterangan", 3, 1000),
});

export const CultureParagraphSchema = z.object({
  paragraph: wajib("Paragraf", 10, 5000),
});

/* ---------- Pengaturan pembayaran ---------- */
export const PaymentSettingsSchema = z.object({
  bankName: opsional(80),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d*$/, "Nomor rekening hanya boleh angka.")
    .max(30)
    .optional()
    .default(""),
  accountName: opsional(120),
  qrisMerchantName: opsional(120),
  qrisImage: opsional(500),
  whatsapp: z
    .string()
    .trim()
    .regex(/^(\d{9,15})?$/, "Nomor WhatsApp 9-15 digit angka, mis. 6281234567890.")
    .optional()
    .default(""),
});

/* ---------- Tipe TypeScript otomatis dari schema ---------- */
export type LoginInput = z.infer<typeof LoginSchema>;
export type TopengInput = z.infer<typeof TopengSchema>;
export type ArtikelInput = z.infer<typeof ArtikelSchema>;
export type PengumumanInput = z.infer<typeof PengumumanSchema>;
export type GaleriInput = z.infer<typeof GaleriSchema>;
export type FaqInput = z.infer<typeof FaqSchema>;
export type ForumInput = z.infer<typeof ForumSchema>;
export type TimelineInput = z.infer<typeof TimelineSchema>;
export type PaymentSettingsInput = z.infer<typeof PaymentSettingsSchema>;

/* ---------- State hasil validasi / server action (seperti punya dosen) ---------- */
export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  values?: Record<string, string>; // isian terakhir, supaya form tidak kosong lagi saat gagal
};

/* ---------- Helper: jalankan schema, kembalikan ActionState ---------- */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { state: ActionState; data?: z.infer<T> } {
  const parsed = schema.safeParse(data);
  if (parsed.success) return { state: { success: true }, data: parsed.data };
  return {
    state: {
      success: false,
      message: "Periksa kembali isian form.",
      errors: parsed.error.flatten().fieldErrors,
    },
  };
}