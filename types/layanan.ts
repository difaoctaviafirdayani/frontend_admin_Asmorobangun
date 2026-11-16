export interface LayananApi {
  id: string;
  name: string;
  priceInfo?: string;
  price?: number | null;
  availableDays?: number[];
  shortDesc?: string;
  longDesc?: string;
  image?: string;
}

export interface Layanan extends LayananApi {
  priceText: string;
  description: string;
}