/**
 * @param {import("@/types/galeri").GaleriApi} g
 * @returns {import("@/types/galeri").Galeri}
 */
export function toGaleriView(g) {
  return {
    ...g,
    description: g.caption ?? "",
  };
}