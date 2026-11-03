export interface TimelinePoint {
  id: string;
  year: string;
  text: string;
}

export interface CultureInfo {
  timeline: TimelinePoint[];
  paragraph: string;
  updatedAt?: string;
}