export interface LayananApi {
  id: string;
  name: string;
  priceInfo?: string;
  shortDesc?: string;
  longDesc?: string;
  image?: string;
}

export interface Layanan extends LayananApi {
  price: string;
  description: string;
}