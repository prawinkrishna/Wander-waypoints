import { Place } from './place.model';

export interface TripPlace {
    tripPlaceId: string;
    tripId: string;
    placeId: string;
    place: Place;
    order: number;
    arrivalDate?: Date;
    departureDate?: Date;
    transportMode?: string;

    // New Itinerary Fields
    dayNumber?: number;
    startTime?: string;
    notes?: string;
    distanceFromPrev?: number;
    travelTimeFromPrev?: number;
}
