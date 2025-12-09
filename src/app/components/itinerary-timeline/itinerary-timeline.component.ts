import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TripPlace } from '../../../../projects/wander-library/src/lib/models/trip-place.model';

interface DayGroup {
    dayNumber: number;
    places: TripPlace[];
}

@Component({
    selector: 'app-itinerary-timeline',
    templateUrl: './itinerary-timeline.component.html',
    styleUrls: ['./itinerary-timeline.component.scss']
})
export class ItineraryTimelineComponent implements OnInit, OnChanges {
    @Input() tripPlaces: TripPlace[] = [];
    groupedPlaces: DayGroup[] = [];

    constructor() { }

    ngOnInit(): void {
        this.groupPlacesByDay();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['tripPlaces']) {
            this.groupPlacesByDay();
        }
    }

    groupPlacesByDay() {
        if (!this.tripPlaces) return;

        const groups = new Map<number, TripPlace[]>();

        this.tripPlaces.forEach(place => {
            const day = place.dayNumber || 1; // Default to Day 1 if not set
            if (!groups.has(day)) {
                groups.set(day, []);
            }
            groups.get(day)?.push(place);
        });

        // Sort days and places within days
        this.groupedPlaces = Array.from(groups.entries())
            .map(([dayNumber, places]) => ({
                dayNumber,
                places: places.sort((a, b) => (a.order || 0) - (b.order || 0))
            }))
            .sort((a, b) => a.dayNumber - b.dayNumber);
    }

    getCategoryIcon(category: string): string {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('food') || cat.includes('restaurant')) return 'restaurant';
        if (cat.includes('sight') || cat.includes('view')) return 'landscape';
        if (cat.includes('stay') || cat.includes('hotel')) return 'hotel';
        if (cat.includes('activity')) return 'hiking';
        return 'place';
    }
}
