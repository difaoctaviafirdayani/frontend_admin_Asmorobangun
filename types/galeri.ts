/** Bentuk data dari backend */
export interface GaleriApi {
  id: string;
  title: string;
  caption?: string;
  image: string;
}

/** Bentuk data untuk tampilan kartu */
export interface Galeri extends GaleriApi {
  description: string;
}