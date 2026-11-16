export interface PaymentMethods {
  cash?: { enabled?: boolean; note?: string };
  transfer?: { enabled?: boolean; note?: string };
  qris?: { enabled?: boolean; image?: string };
}

export interface Kelas {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  longDesc: string;
  priceInfo: string;
  /** harga dalam rupiah (angka) */
  price?: number | null;
  /** hari buka, 1 = Senin ... 7 = Minggu; kosong = setiap hari */
  availableDays?: number[];
  image: string;
  bookingType: string;
  avgRating: number | null;
  reviewCount: number;
  paymentMethods?: PaymentMethods;
}

export interface KelasReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

/** State form edit kelas */
export interface KelasFormState {
  name: string;
  price: string;
  priceInfo: string;
  availableDays: number[];
  longDesc: string;
  image: string;
  cashOn: boolean;
  cashNote: string;
  trfOn: boolean;
  trfNote: string;
  qrisOn: boolean;
  qrisImg: string;
}