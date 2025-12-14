export interface Place {
  placeId: string;
  name: string;
  address?: string; // Backend uses 'address', not 'location'
  location?: string; // Keep for backward compatibility
  description?: string;
  image?: string;
  latitude: string;
  longitude: string;
  category: any;
  visitedBy?: any; // Backend includes this
  rating?: number;
  bookingUrl?: string;
}
