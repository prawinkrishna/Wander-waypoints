export interface Place {
  placeId: string;
  name: string;
  address?: string;
  location?: string; // Keep for backward compatibility
  description?: string;
  image?: string;
  imageUrl?: string;
  latitude: string;
  longitude: string;
  category: any;
  visitedBy?: any;
  rating?: number;
  country?: string;
  bookingUrl?: string;
}
