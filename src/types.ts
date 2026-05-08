
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
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue?: number; // Optional if we had price data
  bookingsByOccasion: Record<string, number>;
  bookingsByMonth: Record<string, number>;
  recentBookings: Booking[];
}
