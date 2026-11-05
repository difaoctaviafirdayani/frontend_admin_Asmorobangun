import type { Galeri, GaleriApi } from "@/types/galeri";

export function toGaleriView(g: GaleriApi): Galeri {
  return {
    ...g,
    description: g.caption ?? "",
  };
}