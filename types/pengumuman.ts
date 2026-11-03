/** Bentuk data dari backend */
export interface PengumumanApi {
  id: string;
  title: string;
  type: string;
  color?: string;
  body: string;
  image?: string;
  date: string;
}

/** Bentuk data untuk tampilan tabel (date sudah diformat) */
export interface Pengumuman extends PengumumanApi {
  category: string;
  content: string;
}