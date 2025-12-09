export interface Place {
  placeId: string;
  name: string;
  address?: string; // Backend uses 'address', not 'location'
  location?: string; // Keep for backward compatibility
  description?: string; // Optional - backend may not have this
  image?: string; // Optional - backend may not have this
  latitude: string;
  longitude: string;
  category: any;
  visitedBy?: any; // Backend includes this
}
