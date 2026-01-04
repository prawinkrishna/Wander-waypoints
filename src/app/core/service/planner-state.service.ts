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

    constructor() { }

    updateTrip(aiResponseKey: any) {
        if (!aiResponseKey || !aiResponseKey.itinerary) return;

        const convertedPlaces: TripPlace[] = [];

        aiResponseKey.itinerary.forEach((day: any) => {
            day.activities.forEach((activity: any, index: number) => {
                convertedPlaces.push(this.transformActivityToTripPlace(activity, day.day_number, index));
            });
        });

        this._currentTripPlaces.next(convertedPlaces);
    }

    setMapMode(isMap: boolean) {
        this._isMapMode.next(isMap);
    }

    private transformActivityToTripPlace(activity: any, dayNumber: number, order: number): TripPlace {
        // Mock Coordinates generation logic (since the mock JSON doesn't have them yet)
        // In real app, we would geocode "Wat Pho" -> lat/lng
        const mockCoords = this.getMockCoordinates(activity.place_name);

        return {
            tripPlaceId: Math.random().toString(36).substr(2, 9), // Temp ID
            tripId: 'temp-trip-id',
            placeId: 'temp-place-' + Math.random(),
            dayNumber: dayNumber,
            order: order,
            notes: activity.description,
            place: {
                placeId: 'place-' + Math.random(),
                name: activity.place_name,
                category: this.inferCategory(activity.activity_title),
                address: 'Bangkok, Thailand', // Placeholder
                latitude: mockCoords[0].toString(),
                longitude: mockCoords[1].toString(),
                rating: 4.5,
                description: activity.activity_title
            } as Place
        };
    }

    private inferCategory(title: string): string {
        const t = title.toLowerCase();
        if (t.includes('temple') || t.includes('museum')) return 'sight';
        if (t.includes('food') || t.includes('dine') || t.includes('lunch')) return 'food';
        return 'activity';
    }

    private getMockCoordinates(name: string): [number, number] {
        // Returns vaguely Bangkok coordinates with random jitter
        const baseLat = 13.7563;
        const baseLng = 100.5018;
        return [
            baseLat + (Math.random() - 0.5) * 0.05,
            baseLng + (Math.random() - 0.5) * 0.05
        ];
    }
}
