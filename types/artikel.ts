/** Bentuk data dari backend */
export interface ArtikelApi {
  id: string;
  title: string;
  category: string;
  excerpt?: string;
  content: string;
  image?: string;
  date: string;
}

/** Bentuk data untuk tampilan tabel (date sudah diformat) */
export type Artikel = ArtikelApi;