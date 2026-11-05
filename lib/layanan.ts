import type { Layanan, LayananApi } from "@/types/layanan";

export function toLayananView(f: LayananApi): Layanan {
  return {
    ...f,
    price: f.priceInfo ?? "",
    description: f.shortDesc ?? "",
  };
}