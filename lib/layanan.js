/**
 * @param {import("@/types/layanan").LayananApi} f
 * @returns {import("@/types/layanan").Layanan}
 */
export function toLayananView(f) {
  return {
    ...f,
    price: f.priceInfo ?? "",
    description: f.shortDesc ?? "",
  };
}