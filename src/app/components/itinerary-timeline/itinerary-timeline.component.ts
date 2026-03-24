import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TripPlace } from '../../../../projects/wander-library/src/lib/models/trip-place.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

interface DayGroup {
    dayNumber: number;
    places: (TripPlace & { isEditing?: boolean; editData?: EditableFields })[];
}

interface EditableFields {
    name: string;
    startTime: string;
    duration: number;
    notes: string;
    address: string;
    transportMode: string;
    travelTimeFromPrev: number;
}

@Component({
    selector: 'app-itinerary-timeline',
    templateUrl: './itinerary-timeline.component.html',
    styleUrls: ['./itinerary-timeline.component.scss']
})
export class ItineraryTimelineComponent implements OnInit, OnChanges {
    @Input() tripPlaces: TripPlace[] = [];
    @Input() isOwner: boolean = false;
    @Input() tripStartDate: Date | string | null = null;
    @Input() enableInlineEditing: boolean = false;
    @Output() placeDeleted = new EventEmitter<string>();
    @Output() placesReordered = new EventEmitter<TripPlace[]>();
    @Output() placeUpdated = new EventEmitter<{ tripPlaceId: string; data: Partial<TripPlace & { place: any }> }>();

    groupedPlaces: DayGroup[] = [];
    collapsedDays = new Set<number>();

    // Transport editing
    transportModes = [
        { value: 'walk', label: 'Walk', icon: 'directions_walk' },
        { value: 'bus', label: 'Bus', icon: 'directions_bus' },
        { value: 'train', label: 'Train/Metro', icon: 'directions_railway' },
        { value: 'cab', label: 'Cab', icon: 'local_taxi' },
        { value: 'car', label: 'Car', icon: 'directions_car' },
        { value: 'bike', label: 'Bike', icon: 'directions_bike' },
        { value: 'flight', label: 'Flight', icon: 'flight' },
        { value: 'ferry', label: 'Ferry', icon: 'directions_boat' }
    ];

    editingConnectorId: string | null = null;
    connectorEditData: { transportMode: string; travelTimeFromPrev: number } | null = null;

    // Default placeholder image
    readonly defaultImage = 'assets/images/place-placeholder.svg';

    constructor(private router: Router, private dialog: MatDialog) { }

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
            const day = place.dayNumber || 1;
            if (!groups.has(day)) {
                groups.set(day, []);
            }
            groups.get(day)?.push(place);
        });

        this.groupedPlaces = Array.from(groups.entries())
            .map(([dayNumber, places]) => ({
                dayNumber,
                places: places.sort((a, b) => (a.order || 0) - (b.order || 0))
            }))
            .sort((a, b) => a.dayNumber - b.dayNumber);
    }

    // Get formatted date for a day number
    getDayDate(dayNumber: number): string {
        if (!this.tripStartDate) return '';
        const date = new Date(this.tripStartDate);
        date.setDate(date.getDate() + dayNumber - 1);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    // Get place image or fallback to placeholder
    getPlaceImage(tripPlace: TripPlace): string {
        return tripPlace.place?.image || tripPlace.place?.imageUrl || this.defaultImage;
    }

    // Check if using default image
    isDefaultImage(tripPlace: TripPlace): boolean {
        return !tripPlace.place?.image && !tripPlace.place?.imageUrl;
    }

    // Get time slot icon
    getTimeSlotIcon(timeSlot: string | undefined): string {
        switch (timeSlot?.toLowerCase()) {
            case 'morning': return 'wb_twilight';
            case 'afternoon': return 'wb_sunny';
            case 'evening': return 'nights_stay';
            case 'night': return 'bedtime';
            default: return 'schedule';
        }
    }

    // Get time slot label
    getTimeSlotLabel(timeSlot: string | undefined): string {
        if (!timeSlot) return '';
        return timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1);
    }

    // Get category icon
    getCategoryIcon(category: string | undefined): string {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('restaurant') || cat.includes('food') || cat.includes('cafe') || cat.includes('dining')) return 'restaurant';
        if (cat.includes('hotel') || cat.includes('stay') || cat.includes('accommodation') || cat.includes('hostel')) return 'hotel';
        if (cat.includes('museum') || cat.includes('art')) return 'museum';
        if (cat.includes('beach')) return 'beach_access';
        if (cat.includes('shopping') || cat.includes('mall') || cat.includes('market')) return 'shopping_bag';
        if (cat.includes('landmark') || cat.includes('monument') || cat.includes('temple') || cat.includes('church')) return 'account_balance';
        if (cat.includes('park') || cat.includes('garden') || cat.includes('nature')) return 'park';
        if (cat.includes('activity') || cat.includes('adventure') || cat.includes('sport')) return 'sports';
        if (cat.includes('bar') || cat.includes('nightlife') || cat.includes('club')) return 'nightlife';
        if (cat.includes('airport') || cat.includes('transport')) return 'flight';
        return 'place';
    }

    // Get category color
    getCategoryColor(category: string | undefined): string {
        const cat = category?.toLowerCase() || '';
        if (cat.includes('restaurant') || cat.includes('food') || cat.includes('cafe')) return '#FF6B6B';
        if (cat.includes('hotel') || cat.includes('stay') || cat.includes('accommodation')) return '#4ECDC4';
        if (cat.includes('museum') || cat.includes('art')) return '#9B59B6';
        if (cat.includes('beach')) return '#3498DB';
        if (cat.includes('shopping')) return '#E91E63';
        if (cat.includes('landmark') || cat.includes('monument')) return '#F39C12';
        if (cat.includes('park') || cat.includes('nature')) return '#2ECC71';
        if (cat.includes('activity') || cat.includes('sport')) return '#1ABC9C';
        if (cat.includes('bar') || cat.includes('nightlife')) return '#8E44AD';
        return '#667EEA';
    }

    // Format travel time
    formatTravelTime(minutes: number | undefined): string {
        if (!minutes) return '';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    // Format distance
    formatDistance(km: number | undefined): string {
        if (!km) return '';
        return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)} km`;
    }

    // Calculate End Time from Start Time + Duration
    getEndTime(startTime: string | undefined, durationMinutes: number | undefined): string {
        if (!startTime || !durationMinutes) return '';
        const [hours, mins] = startTime.split(':').map(Number);
        const totalMins = hours * 60 + mins + durationMinutes;
        const endHour = Math.floor(totalMins / 60) % 24; // Handle overflow past midnight
        const endMin = totalMins % 60;
        return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    }

    // Format Duration for Display (e.g., 90 -> "1h 30m")
    formatDuration(minutes: number | undefined): string {
        if (!minutes) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
    }

    // Get transport icon
    getTransportIcon(mode: string | undefined): string {
        switch (mode?.toLowerCase()) {
            case 'car': case 'taxi': case 'uber': return 'directions_car';
            case 'walk': case 'walking': return 'directions_walk';
            case 'bike': case 'bicycle': return 'directions_bike';
            case 'bus': return 'directions_bus';
            case 'train': case 'metro': case 'subway': return 'directions_railway';
            case 'flight': case 'plane': return 'flight';
            case 'boat': case 'ferry': return 'directions_boat';
            default: return 'directions_car';
        }
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

    viewPlaceDetails(tripPlace: TripPlace) {
        if (tripPlace?.place?.placeId) {
            this.router.navigate(['/place-details', tripPlace.place.placeId]);
        }
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
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Remove Place',
                message: 'Remove this place from your itinerary?',
                type: 'warning',
                confirmText: 'Remove',
                cancelText: 'Cancel'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.placeDeleted.emit(tripPlaceId);
            }
        });
    }

    onReorderPlace(event: CdkDragDrop<TripPlace[]>, dayGroup: DayGroup) {
        moveItemInArray(dayGroup.places, event.previousIndex, event.currentIndex);

        dayGroup.places.forEach((place, index) => {
            place.order = index;
        });

        const allPlaces = this.groupedPlaces.flatMap(group => group.places);
        this.placesReordered.emit(allPlaces);
    }

    getPlaceCount(dayNumber: number): number {
        const group = this.groupedPlaces.find(g => g.dayNumber === dayNumber);
        return group?.places.length || 0;
    }

    // Inline Editing Methods
    startEditing(item: TripPlace & { isEditing?: boolean; editData?: EditableFields }) {
        if (!this.enableInlineEditing || !this.isOwner) return;

        item.isEditing = true;
        item.editData = {
            name: item.place?.name || '',
            startTime: item.startTime || '',
            duration: item.duration || 0,
            notes: item.notes || '',
            address: item.place?.address || '',
            transportMode: item.transportMode || 'car',
            travelTimeFromPrev: item.travelTimeFromPrev || 0
        };
    }

    cancelEditing(item: TripPlace & { isEditing?: boolean; editData?: EditableFields }) {
        item.isEditing = false;
        item.editData = undefined;
    }

    saveEditing(item: TripPlace & { isEditing?: boolean; editData?: EditableFields }) {
        if (!item.editData) return;

        const updateData = {
            startTime: item.editData.startTime,
            duration: item.editData.duration,
            notes: item.editData.notes,
            transportMode: item.editData.transportMode,
            travelTimeFromPrev: item.editData.travelTimeFromPrev,
            place: {
                name: item.editData.name,
                address: item.editData.address
            }
        };

        // Update local state
        item.startTime = item.editData.startTime;
        item.duration = item.editData.duration;
        item.notes = item.editData.notes;
        item.transportMode = item.editData.transportMode;
        item.travelTimeFromPrev = item.editData.travelTimeFromPrev;
        if (item.place) {
            item.place.name = item.editData.name;
            item.place.address = item.editData.address;
        }

        // Emit event for parent to save
        this.placeUpdated.emit({
            tripPlaceId: item.tripPlaceId,
            data: updateData
        });

        item.isEditing = false;
        item.editData = undefined;
    }

    onEditFieldKeydown(event: KeyboardEvent, item: TripPlace & { isEditing?: boolean; editData?: EditableFields }) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.saveEditing(item);
        } else if (event.key === 'Escape') {
            this.cancelEditing(item);
        }
    }

    // Connector editing methods
    startConnectorEditing(nextItem: TripPlace) {
        if (!this.enableInlineEditing || !this.isOwner) return;

        this.editingConnectorId = nextItem.tripPlaceId;
        this.connectorEditData = {
            transportMode: nextItem.transportMode || 'car',
            travelTimeFromPrev: nextItem.travelTimeFromPrev || 0
        };
    }

    saveConnectorEditing(nextItem: TripPlace) {
        if (!this.connectorEditData) return;

        nextItem.transportMode = this.connectorEditData.transportMode;
        nextItem.travelTimeFromPrev = this.connectorEditData.travelTimeFromPrev;

        this.placeUpdated.emit({
            tripPlaceId: nextItem.tripPlaceId,
            data: {
                transportMode: this.connectorEditData.transportMode,
                travelTimeFromPrev: this.connectorEditData.travelTimeFromPrev
            }
        });

        this.editingConnectorId = null;
        this.connectorEditData = null;
    }

    cancelConnectorEditing() {
        this.editingConnectorId = null;
        this.connectorEditData = null;
    }

    getTransportLabel(mode: string): string {
        const found = this.transportModes.find(m => m.value === mode);
        return found ? found.label : mode;
    }
}
