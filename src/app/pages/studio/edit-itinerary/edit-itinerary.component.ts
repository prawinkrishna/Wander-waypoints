import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AgentService, Accommodation, TransportSegment, PricingItem, ItineraryStatus, ClientEditMode } from '../../../core/service/agent.service';
import { PlaceSearchDialogComponent, PlaceSearchDialogResult } from '../../../components/place-search-dialog/place-search-dialog.component';
import { ShareItineraryDialogComponent } from '../../../components/share-itinerary-dialog/share-itinerary-dialog.component';
import { ConfirmDialogComponent } from '../../../components/shared/confirm-dialog/confirm-dialog.component';

interface TripPlace {
    tripPlaceId: string;
    dayNumber: number;
    startTime: string;
    order: number;
    timeSlot: string;
    duration: number;
    notes: string;
    place: {
        placeId: string;
        name: string;
        address: string;
        category: string;
        description: string;
    };
    isEditing?: boolean;
}

interface DayGroup {
    dayNumber: number;
    date: Date;
    places: TripPlace[];
    isCollapsed: boolean;
}

@Component({
    selector: 'app-edit-itinerary',
    templateUrl: './edit-itinerary.component.html',
    styleUrls: ['./edit-itinerary.component.scss']
})
export class EditItineraryComponent implements OnInit {
    tripId: string = '';
    trip: any = null;
    isLoading = true;
    isSaving = false;

    dayGroups: DayGroup[] = [];
    accommodations: Accommodation[] = [];
    transportSegments: TransportSegment[] = [];
    pricingItems: PricingItem[] = [];
    inclusions: string[] = [];
    exclusions: string[] = [];

    tripForm!: FormGroup;
    activeTab = 0;

    newInclusion = '';
    newExclusion = '';

    // Sharing
    itineraryStatus: ItineraryStatus = 'draft';
    isShared = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private agentService: AgentService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.tripId = this.route.snapshot.paramMap.get('id') || '';
        if (this.tripId) {
            this.loadTrip();
        }
        this.initForm();
    }

    initForm() {
        this.tripForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            clientName: [''],
            clientEmail: [''],
            clientPhone: [''],
            validUntil: [null],
            customTerms: [''],
            specialNotes: ['']
        });
    }

    loadTrip() {
        this.isLoading = true;
        this.agentService.getItinerary(this.tripId).subscribe({
            next: (trip) => {
                this.trip = trip;
                this.populateForm(trip);
                this.groupPlacesByDay(trip.places || []);
                this.accommodations = trip.accommodations || [];
                this.transportSegments = trip.transportSegments || [];
                this.pricingItems = trip.pricingBreakdown || [];
                this.inclusions = trip.inclusions || [];
                this.exclusions = trip.exclusions || [];
                this.itineraryStatus = trip.itineraryStatus || 'draft';
                this.isShared = trip.isShared || false;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading trip:', error);
                this.snackBar.open('Failed to load itinerary', 'Close', { duration: 5000 });
                this.isLoading = false;
            }
        });
    }

    populateForm(trip: any) {
        this.tripForm.patchValue({
            title: trip.title,
            description: trip.description,
            clientName: trip.clientName,
            clientEmail: trip.clientEmail,
            clientPhone: trip.clientPhone,
            validUntil: trip.validUntil ? new Date(trip.validUntil) : null,
            customTerms: trip.customTerms,
            specialNotes: trip.specialNotes
        });
    }

    groupPlacesByDay(places: TripPlace[]) {
        const groups = new Map<number, TripPlace[]>();
        const sortedPlaces = [...places].sort((a, b) => {
            if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
            return a.order - b.order;
        });

        for (const place of sortedPlaces) {
            const day = place.dayNumber || 1;
            if (!groups.has(day)) {
                groups.set(day, []);
            }
            groups.get(day)!.push({ ...place, isEditing: false });
        }

        const startDate = new Date(this.trip?.startDate || new Date());
        this.dayGroups = Array.from(groups.entries()).map(([dayNumber, places]) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + dayNumber - 1);
            return {
                dayNumber,
                date,
                places,
                isCollapsed: false
            };
        });
    }

    // Activity Management
    toggleEditActivity(place: TripPlace) {
        place.isEditing = !place.isEditing;
    }

    saveActivity(place: TripPlace) {
        this.agentService.updateTripPlace(place.tripPlaceId, {
            startTime: place.startTime,
            duration: place.duration,
            notes: place.notes,
            place: {
                name: place.place.name,
                description: place.place.description,
                address: place.place.address
            }
        }).subscribe({
            next: () => {
                place.isEditing = false;
                this.snackBar.open('Activity updated', 'Close', { duration: 2000 });
            },
            error: () => {
                this.snackBar.open('Failed to update activity', 'Close', { duration: 3000 });
            }
        });
    }

    deleteActivity(dayGroup: DayGroup, place: TripPlace) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Delete Activity',
                message: 'Delete this activity?',
                type: 'danger',
                confirmText: 'Delete',
                cancelText: 'Cancel'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (!confirmed) return;

            this.agentService.deleteTripPlace(place.tripPlaceId).subscribe({
                next: () => {
                    const index = dayGroup.places.indexOf(place);
                    if (index > -1) {
                        dayGroup.places.splice(index, 1);
                    }
                    this.snackBar.open('Activity deleted', 'Close', { duration: 2000 });
                },
                error: () => {
                    this.snackBar.open('Failed to delete activity', 'Close', { duration: 3000 });
                }
            });
        });
    }

    openReplacePlaceDialog(place: TripPlace) {
        const dialogRef = this.dialog.open(PlaceSearchDialogComponent, {
            width: '500px',
            data: {
                currentPlace: {
                    name: place.place.name,
                    address: place.place.address
                }
            }
        });

        dialogRef.afterClosed().subscribe((result: PlaceSearchDialogResult | null) => {
            if (result) {
                place.place.name = result.place.name;
                place.place.address = result.place.address;
                this.snackBar.open('Place replaced. Remember to save your changes.', 'Close', { duration: 3000 });
            }
        });
    }

    dropActivity(event: CdkDragDrop<TripPlace[]>, dayGroup: DayGroup) {
        moveItemInArray(dayGroup.places, event.previousIndex, event.currentIndex);
        // Update order
        dayGroup.places.forEach((place, index) => {
            place.order = index;
        });
        // Save reorder
        const orderedIds = dayGroup.places.map(p => p.tripPlaceId);
        this.agentService.reorderTripPlaces(this.tripId, orderedIds).subscribe();
    }

    // Accommodation Management
    addAccommodation() {
        this.accommodations.push({
            hotelName: '',
            starRating: 3,
            roomType: 'Deluxe',
            checkIn: this.trip?.startDate || '',
            checkOut: this.trip?.endDate || '',
            nights: this.calculateNights(),
            perNightCost: 0,
            totalCost: 0
        });
    }

    removeAccommodation(index: number) {
        this.accommodations.splice(index, 1);
    }

    updateAccommodationTotal(acc: Accommodation) {
        acc.totalCost = (acc.perNightCost || 0) * (acc.nights || 0);
        this.recalculateTotals();
    }

    // Transport Management
    addTransport() {
        this.transportSegments.push({
            type: 'Car',
            route: '',
            date: this.trip?.startDate || '',
            time: '',
            operator: '',
            cost: 0
        });
    }

    removeTransport(index: number) {
        this.transportSegments.splice(index, 1);
        this.recalculateTotals();
    }

    // Pricing Management
    addPricingItem() {
        this.pricingItems.push({
            item: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            total: 0
        });
    }

    removePricingItem(index: number) {
        this.pricingItems.splice(index, 1);
        this.recalculateTotals();
    }

    updatePricingItemTotal(item: PricingItem) {
        item.total = (item.quantity || 0) * (item.unitPrice || 0);
        this.recalculateTotals();
    }

    recalculateTotals() {
        // This could be auto-calculated or manually set
    }

    getTotalCost(): number {
        return this.pricingItems.reduce((sum, item) => sum + (item.total || 0), 0);
    }

    getTaxAmount(): number {
        return this.getTotalCost() * 0.18; // 18% GST
    }

    getGrandTotal(): number {
        return this.getTotalCost() + this.getTaxAmount();
    }

    // Inclusions/Exclusions
    addInclusion() {
        if (this.newInclusion.trim()) {
            this.inclusions.push(this.newInclusion.trim());
            this.newInclusion = '';
        }
    }

    removeInclusion(index: number) {
        this.inclusions.splice(index, 1);
    }

    addExclusion() {
        if (this.newExclusion.trim()) {
            this.exclusions.push(this.newExclusion.trim());
            this.newExclusion = '';
        }
    }

    removeExclusion(index: number) {
        this.exclusions.splice(index, 1);
    }

    // Save
    saveItinerary() {
        if (this.tripForm.invalid) {
            this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.isSaving = true;
        const formValue = this.tripForm.value;

        const data = {
            title: formValue.title,
            description: formValue.description,
            clientName: formValue.clientName,
            clientEmail: formValue.clientEmail,
            clientPhone: formValue.clientPhone,
            validUntil: formValue.validUntil?.toISOString?.()?.split('T')[0],
            customTerms: formValue.customTerms,
            specialNotes: formValue.specialNotes,
            accommodations: this.accommodations,
            transportSegments: this.transportSegments,
            pricingBreakdown: this.pricingItems,
            totalCost: this.getTotalCost(),
            taxAmount: this.getTaxAmount(),
            grandTotal: this.getGrandTotal(),
            inclusions: this.inclusions,
            exclusions: this.exclusions
        };

        this.agentService.saveItinerary(this.tripId, data).subscribe({
            next: () => {
                this.isSaving = false;
                this.snackBar.open('Itinerary saved successfully!', 'Close', { duration: 3000 });
            },
            error: (error) => {
                console.error('Save error:', error);
                this.isSaving = false;
                this.snackBar.open('Failed to save itinerary', 'Close', { duration: 5000 });
            }
        });
    }

    // PDF
    downloadPdf() {
        this.agentService.downloadPdf(this.tripId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `itinerary-${this.tripId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => {
                this.snackBar.open('Failed to download PDF', 'Close', { duration: 3000 });
            }
        });
    }

    // Helpers
    calculateNights(): number {
        if (!this.trip?.startDate || !this.trip?.endDate) return 1;
        const start = new Date(this.trip.startDate);
        const end = new Date(this.trip.endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    formatCurrency(amount: number | undefined): string {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        });
    }

    goBack() {
        this.router.navigate(['/studio/itineraries']);
    }

    // Sharing
    openShareDialog() {
        const dialogRef = this.dialog.open(ShareItineraryDialogComponent, {
            width: '500px',
            data: {
                tripId: this.tripId,
                tripTitle: this.trip?.title
            }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.isShared = result.isShared;
                if (result.isShared && this.itineraryStatus === 'draft') {
                    this.itineraryStatus = 'shared';
                } else if (!result.isShared) {
                    this.itineraryStatus = 'draft';
                }
            }
        });
    }

    finalizeItinerary() {
        if (this.itineraryStatus !== 'approved') {
            this.snackBar.open('Can only finalize an approved itinerary', 'Close', { duration: 3000 });
            return;
        }

        this.agentService.finalizeItinerary(this.tripId).subscribe({
            next: () => {
                this.itineraryStatus = 'finalized';
                this.snackBar.open('Itinerary finalized', 'Close', { duration: 2000 });
            },
            error: () => {
                this.snackBar.open('Failed to finalize itinerary', 'Close', { duration: 3000 });
            }
        });
    }

    getStatusLabel(): string {
        const statusLabels: Record<ItineraryStatus, string> = {
            'draft': 'Draft',
            'shared': 'Shared',
            'client_reviewing': 'Client Reviewing',
            'changes_requested': 'Changes Requested',
            'approved': 'Approved',
            'finalized': 'Finalized'
        };
        return statusLabels[this.itineraryStatus] || 'Draft';
    }

    getStatusClass(): string {
        const statusClasses: Record<ItineraryStatus, string> = {
            'draft': 'status-draft',
            'shared': 'status-shared',
            'client_reviewing': 'status-reviewing',
            'changes_requested': 'status-changes',
            'approved': 'status-approved',
            'finalized': 'status-finalized'
        };
        return statusClasses[this.itineraryStatus] || 'status-draft';
    }
}
