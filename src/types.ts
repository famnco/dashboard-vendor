
export type JobProgress = 'UPCOMING' | 'SELECTION AND EDITING' | 'PRINTING' | 'DELIVERING';

export interface Booking {
  timestamp: string;
  email: string;
  occasion: string;
  package: string;
  coupleName: string;
  dateVenue: string;
  instagram: string;
  phone: string;
  proofLink: string;
  price?: number;
  downPayment?: number;
  id?: string;
  additional?: string;
  progressStatus?: JobProgress;
  deliveryDate?: string;
  calendarEventId?: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue?: number; // Optional if we had price data
  bookingsByOccasion: Record<string, number>;
  bookingsByMonth: Record<string, number>;
  recentBookings: Booking[];
}
