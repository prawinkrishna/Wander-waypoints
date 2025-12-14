import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TripPlace } from '../../../../projects/wander-library/src/lib/models/trip-place.model';

interface DayGroup {
    dayNumber: number;
    places: TripPlace[];
}

import { Router } from '@angular/router';

@Component({
    selector: 'app-itinerary-timeline',
    templateUrl: './itinerary-timeline.component.html',
    styleUrls: ['./itinerary-timeline.component.scss']
})
export class ItineraryTimelineComponent implements OnInit, OnChanges {
    @Input() tripPlaces: TripPlace[] = [];
    @Output() placeDeleted = new EventEmitter<string>();
    @Output() placesReordered = new EventEmitter<TripPlace[]>();
    
    groupedPlaces: DayGroup[] = [];
    collapsedDays = new Set<number>();

    constructor(private router: Router) { }

    viewPlaceDetails(tripPlace: TripPlace) {
        if (tripPlace?.place?.placeId) {
            this.router.navigate(['/place-details', tripPlace.place.placeId]);
        }
    }

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

    toggleDay(dayNumber: number) {
        if (this.collapsedDays.has(dayNumber)) {
            this.collapsedDays.delete(dayNumber);
        } else {
            this.collapsedDays.add(dayNumber);
        }
    }

    isDayCollapsed(dayNumber: number): boolean {
        return this.collapsedDays.has(dayNumber);
    }

    isBookable(tripPlace: TripPlace): boolean {
        const category = tripPlace.place?.category?.toLowerCase() || '';
        return category.includes('hotel') || 
               category.includes('accommodation') || 
               category.includes('stay') ||
               category.includes('hostel') ||
               category.includes('resort');
    }

    onBookPlace(tripPlace: TripPlace) {
        if (tripPlace.place?.bookingUrl) {
            window.open(tripPlace.place.bookingUrl, '_blank');
        } else {
            // Fallback: search on Google
            const searchQuery = encodeURIComponent(`${tripPlace.place?.name} ${tripPlace.place?.address} booking`);
            window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
        }
    }

    openDirections(tripPlace: TripPlace) {
        if (tripPlace.place?.latitude && tripPlace.place?.longitude) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${tripPlace.place.latitude},${tripPlace.place.longitude}`;
            window.open(url, '_blank');
        } else if (tripPlace.place?.address) {
            const address = encodeURIComponent(tripPlace.place.address);
            window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
        }
    }

    onDeletePlace(tripPlaceId: string) {
        if (confirm('Are you sure you want to remove this place from your itinerary?')) {
            this.placeDeleted.emit(tripPlaceId);
        }
    }

    onReorderPlace(event: CdkDragDrop<TripPlace[]>, dayGroup: DayGroup) {
        moveItemInArray(dayGroup.places, event.previousIndex, event.currentIndex);
        
        // Update order numbers
        dayGroup.places.forEach((place, index) => {
            place.order = index;
        });

        // Emit the reordered places
        const allPlaces = this.groupedPlaces.flatMap(group => group.places);
        this.placesReordered.emit(allPlaces);
    }

    getCategoryIcon(category: string): string {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('food') || cat.includes('restaurant') || cat.includes('cafe')) return 'restaurant';
        if (cat.includes('sight') || cat.includes('view') || cat.includes('museum')) return 'account_balance';
        if (cat.includes('stay') || cat.includes('hotel') || cat.includes('accommodation')) return 'hotel';
        if (cat.includes('activity') || cat.includes('hiking')) return 'hiking';
        if (cat.includes('shopping')) return 'shopping_bag';
        return 'place';
    }

    getPlaceTypeColor(category: string): string {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('food') || cat.includes('restaurant')) return '#ff4081';
        if (cat.includes('sight') || cat.includes('museum')) return '#e91e63';
        if (cat.includes('stay') || cat.includes('hotel')) return '#e91e63';
        if (cat.includes('activity')) return '#ff4081';
        return '#e91e63';
    }
}
