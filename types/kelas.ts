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
  priceInfo: string;
  longDesc: string;
  image: string;
  cashOn: boolean;
  cashNote: string;
  trfOn: boolean;
  trfNote: string;
  qrisOn: boolean;
  qrisImg: string;
}