/**
 * @param {import("@/types/layanan").LayananApi} f
 * @returns {import("@/types/layanan").Layanan}
 */
export function toLayananView(f) {
  return {
    ...f,
    priceText: f.priceInfo ?? "",
    description: f.shortDesc ?? "",
  };
}
