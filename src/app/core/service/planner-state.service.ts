import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TripPlace } from '../../../../projects/wander-library/src/lib/models/trip-place.model';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';

@Injectable({
    providedIn: 'root'
})
export class PlannerStateService {
    private _currentTripPlaces = new BehaviorSubject<TripPlace[]>([]);
    currentTripPlaces$ = this._currentTripPlaces.asObservable();

    private _isMapMode = new BehaviorSubject<boolean>(false);
    isMapMode$ = this._isMapMode.asObservable();

    private currentDestination: string = '';

    constructor() { }

    updateTrip(aiResponseKey: any) {
        if (!aiResponseKey || !aiResponseKey.itinerary) return;

        // Store the destination from AI response
        this.currentDestination = aiResponseKey.destination || aiResponseKey.trip_title || 'Unknown Location';

        const convertedPlaces: TripPlace[] = [];

        aiResponseKey.itinerary.forEach((day: any) => {
            // Reset start time for each day (e.g., 9:00 AM)
            let currentTimeMinutes = 9 * 60;

            day.activities.forEach((activity: any, index: number) => {
                const result = this.transformActivityToTripPlace(activity, day.day_number, index, currentTimeMinutes);
                convertedPlaces.push(result.place);

                // Advance time: Duration + Travel Time
                currentTimeMinutes += result.duration + result.travelDuration;
            });
        });

        this._currentTripPlaces.next(convertedPlaces);
    }

    setMapMode(isMap: boolean) {
        this._isMapMode.next(isMap);
    }

    private transformActivityToTripPlace(activity: any, dayNumber: number, order: number, startTimeMinutes: number): { place: TripPlace, duration: number, travelDuration: number } {
        // Use coordinates from AI response if available, otherwise generate mock ones
        const coords = this.getCoordinates(activity);

        // Try to guess default duration if missing (Smart Defaults)
        let duration = activity.duration;
        if (!duration) {
            const name = (activity.place_name || '').toLowerCase();
            const title = (activity.activity_title || '').toLowerCase();
            if (name.includes('museum') || name.includes('art') || title.includes('museum')) duration = 90;
            else if (name.includes('restaurant') || name.includes('cafe') || title.includes('lunch') || title.includes('dinner')) duration = 60;
            else duration = 60;
        }

        const travelDuration = activity.travel_time || 30; // Default 30 mins travel

        // Format start time string (e.g. "09:30")
        const h = Math.floor(startTimeMinutes / 60);
        const m = startTimeMinutes % 60;
        const startTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

        // Determine Time Slot
        let timeSlot = 'morning';
        if (h >= 12 && h < 17) timeSlot = 'afternoon';
        else if (h >= 17 && h < 20) timeSlot = 'evening';
        else if (h >= 20) timeSlot = 'night';

        const tripPlace: TripPlace = {
            tripPlaceId: Math.random().toString(36).substr(2, 9), // Temp ID
            tripId: 'temp-trip-id',
            placeId: 'temp-place-' + Math.random(),
            dayNumber: dayNumber,
            order: order,
            notes: activity.description,
            // New Time Fields
            timeSlot: timeSlot,
            startTime: startTimeStr,
            duration: duration,
            travelDuration: travelDuration,
            place: {
                placeId: 'place-' + Math.random(),
                name: activity.place_name,
                category: this.inferCategory(activity.activity_title),
                address: activity.address || activity.location || this.currentDestination,
                latitude: coords[0].toString(),
                longitude: coords[1].toString(),
                rating: activity.rating || 4.5,
                description: activity.activity_title
            } as Place
        };

        return { place: tripPlace, duration, travelDuration };
    }

    private inferCategory(title: string): string {
        const t = title.toLowerCase();
        if (t.includes('temple') || t.includes('museum')) return 'sight';
        if (t.includes('food') || t.includes('dine') || t.includes('lunch')) return 'food';
        return 'activity';
    }

    private getCoordinates(activity: any): [number, number] {
        // Use coordinates from AI response if available
        if (activity.latitude && activity.longitude) {
            return [parseFloat(activity.latitude), parseFloat(activity.longitude)];
        }

        // Generate mock coordinates with random jitter around a base location
        // In production, this would call a geocoding service
        const baseLat = 0;
        const baseLng = 0;
        return [
            baseLat + (Math.random() - 0.5) * 10,
            baseLng + (Math.random() - 0.5) * 10
        ];
    }
}

