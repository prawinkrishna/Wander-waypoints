import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    AgentService,
    SharedItinerary,
    ItineraryStatus,
    ClientEditMode,
    Accommodation,
    TransportSegment,
    StatusHistoryEntry
} from '../../core/service/agent.service';

interface TripPlace {
    tripPlaceId: string;
    dayNumber: number;
    startTime?: string;
    order: number;
    timeSlot?: string;
    duration?: number;
    notes?: string;
    clientNotes?: string;
    approved?: boolean;
    place: {
        placeId?: string;
        name: string;
        address?: string;
        category?: string;
        description?: string;
    };
    isEditing?: boolean;
}

interface DayGroup {
    dayNumber: number;
    date: Date;
    places: TripPlace[];
}

@Component({
    selector: 'app-shared-itinerary',
    templateUrl: './shared-itinerary.component.html',
    styleUrls: ['./shared-itinerary.component.scss']
})
export class SharedItineraryComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    token: string = '';
    itinerary: SharedItinerary | null = null;
    isLoading = true;
    isSaving = false;
    error: string | null = null;
    errorType: 'expired' | 'not_found' | 'generic' = 'generic';

    dayGroups: DayGroup[] = [];

    // Password gate
    requiresPassword = false;
    passwordInput = '';
    passwordError = '';
    isVerifying = false;

    // Status history
    showHistory = false;

    constructor(
        private route: ActivatedRoute,
        private agentService: AgentService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        this.token = this.route.snapshot.paramMap.get('token') || '';
        if (this.token) {
            this.loadItinerary();
        } else {
            this.error = 'Invalid share link';
            this.isLoading = false;
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadItinerary() {
        this.isLoading = true;
        this.agentService.getSharedItinerary(this.token).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                if ((data as any).requiresPassword) {
                    this.requiresPassword = true;
                    this.isLoading = false;
                    return;
                }
                this.itinerary = data;
                this.groupPlacesByDay(data.places || []);
                this.isLoading = false;
            },
            error: (err) => {
                const message = err.error?.message || '';
                if (message.includes('expired')) {
                    this.errorType = 'expired';
                    this.error = 'This shared link has expired. Please contact the travel agency for a new link.';
                } else {
                    this.errorType = 'not_found';
                    this.error = 'This itinerary is no longer available or the link has expired.';
                }
                this.isLoading = false;
            }
        });
    }

    verifyPassword() {
        if (!this.passwordInput) return;
        this.isVerifying = true;
        this.passwordError = '';
        this.agentService.verifySharePassword(this.token, this.passwordInput).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.requiresPassword = false;
                this.itinerary = data;
                this.groupPlacesByDay(data.places || []);
                this.isVerifying = false;
            },
            error: (err) => {
                this.passwordError = err.error?.message || 'Incorrect password';
                this.isVerifying = false;
            }
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

        const startDate = new Date(this.itinerary?.startDate || new Date());
        this.dayGroups = Array.from(groups.entries()).map(([dayNumber, places]) => {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + dayNumber - 1);
            return { dayNumber, date, places };
        });
    }

    // Edit mode checks
    canAddNotes(): boolean {
        return this.itinerary?.clientEditMode === 'notes_only' ||
               this.itinerary?.clientEditMode === 'approve_reject' ||
               this.itinerary?.clientEditMode === 'full_edit';
    }

    canApproveReject(): boolean {
        return this.itinerary?.clientEditMode === 'approve_reject' ||
               this.itinerary?.clientEditMode === 'full_edit';
    }

    canFullEdit(): boolean {
        return this.itinerary?.clientEditMode === 'full_edit';
    }

    isViewOnly(): boolean {
        return this.itinerary?.clientEditMode === 'none';
    }

    isFinalized(): boolean {
        return this.itinerary?.itineraryStatus === 'finalized';
    }

    // Activity interactions
    toggleEditActivity(place: TripPlace) {
        if (this.canFullEdit() && !this.isFinalized()) {
            place.isEditing = !place.isEditing;
        }
    }

    saveActivityNotes(place: TripPlace) {
        this.isSaving = true;
        this.agentService.updateSharedItinerary(this.token, {
            activityNotes: [{ tripPlaceId: place.tripPlaceId, notes: place.clientNotes || '' }]
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.isSaving = false;
                this.snackBar.open('Notes saved', 'Close', { duration: 2000 });
            },
            error: () => {
                this.isSaving = false;
                this.snackBar.open('Failed to save notes', 'Close', { duration: 3000 });
            }
        });
    }

    approveActivity(place: TripPlace) {
        place.approved = true;
        this.isSaving = true;
        this.agentService.updateSharedItinerary(this.token, {
            activityApprovals: [{ tripPlaceId: place.tripPlaceId, approved: true, notes: place.clientNotes }]
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.isSaving = false;
                this.snackBar.open('Activity approved', 'Close', { duration: 2000 });
            },
            error: () => {
                this.isSaving = false;
                place.approved = false;
                this.snackBar.open('Failed to approve activity', 'Close', { duration: 3000 });
            }
        });
    }

    rejectActivity(place: TripPlace) {
        place.approved = false;
        this.isSaving = true;
        this.agentService.updateSharedItinerary(this.token, {
            activityApprovals: [{ tripPlaceId: place.tripPlaceId, approved: false, notes: place.clientNotes }]
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.isSaving = false;
                this.snackBar.open('Activity rejected', 'Close', { duration: 2000 });
            },
            error: () => {
                this.isSaving = false;
                this.snackBar.open('Failed to reject activity', 'Close', { duration: 3000 });
            }
        });
    }

    saveActivityChanges(place: TripPlace) {
        this.isSaving = true;
        this.agentService.updateSharedItinerary(this.token, {
            activities: [{
                tripPlaceId: place.tripPlaceId,
                startTime: place.startTime || '',
                duration: place.duration || 0,
                notes: place.notes || '',
                place: {
                    name: place.place?.name || '',
                    description: place.place?.description || '',
                    address: place.place?.address || ''
                }
            }]
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                place.isEditing = false;
                this.isSaving = false;
                this.snackBar.open('Changes saved', 'Close', { duration: 2000 });
            },
            error: () => {
                this.isSaving = false;
                this.snackBar.open('Failed to save changes', 'Close', { duration: 3000 });
            }
        });
    }

    // Status actions
    requestChanges() {
        this.isSaving = true;
        this.agentService.updateClientStatus(this.token, 'changes_requested').pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                if (this.itinerary) {
                    this.itinerary.itineraryStatus = 'changes_requested';
                }
                this.isSaving = false;
                this.snackBar.open('Changes requested. The agency will be notified.', 'Close', { duration: 3000 });
            },
            error: () => {
                this.isSaving = false;
                this.snackBar.open('Failed to request changes', 'Close', { duration: 3000 });
            }
        });
    }

    approveItinerary() {
        this.isSaving = true;
        this.agentService.updateClientStatus(this.token, 'approved').pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                if (this.itinerary) {
                    this.itinerary.itineraryStatus = 'approved';
                }
                this.isSaving = false;
                this.snackBar.open('Itinerary approved! The agency will finalize your booking.', 'Close', { duration: 3000 });
            },
            error: () => {
                this.isSaving = false;
                this.snackBar.open('Failed to approve itinerary', 'Close', { duration: 3000 });
            }
        });
    }

    // Status history
    toggleHistory() {
        this.showHistory = !this.showHistory;
    }

    getHistoryStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'draft': 'Draft',
            'shared': 'Shared with Client',
            'client_reviewing': 'Client Viewing',
            'changes_requested': 'Changes Requested',
            'approved': 'Approved',
            'finalized': 'Finalized'
        };
        return labels[status] || status;
    }

    getHistoryStatusIcon(status: string): string {
        const icons: Record<string, string> = {
            'draft': 'edit',
            'shared': 'share',
            'client_reviewing': 'visibility',
            'changes_requested': 'feedback',
            'approved': 'check_circle',
            'finalized': 'verified'
        };
        return icons[status] || 'info';
    }

    // Helpers
    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    formatDateTime(dateStr: string): string {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatCurrency(amount: number | undefined): string {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    getStatusLabel(): string {
        const statusLabels: Record<ItineraryStatus, string> = {
            'draft': 'Draft',
            'shared': 'Shared',
            'client_reviewing': 'Under Review',
            'changes_requested': 'Changes Requested',
            'approved': 'Approved',
            'finalized': 'Confirmed'
        };
        return statusLabels[this.itinerary?.itineraryStatus || 'draft'] || 'Draft';
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
        return statusClasses[this.itinerary?.itineraryStatus || 'draft'] || 'status-draft';
    }

    canTakeStatusAction(): boolean {
        const status = this.itinerary?.itineraryStatus;
        return status === 'shared' || status === 'client_reviewing';
    }

    getTransportIcon(type: string): string {
        const icons: Record<string, string> = {
            'Flight': 'flight',
            'Train': 'train',
            'Bus': 'directions_bus',
            'Private Car': 'directions_car',
            'Cab': 'local_taxi',
            'Ferry': 'directions_boat'
        };
        return icons[type] || 'commute';
    }

    getStarArray(rating: number | undefined): number[] {
        return Array(rating || 0).fill(0);
    }

    retryLoad(): void {
        this.error = null;
        this.loadItinerary();
    }

    trackByDayNumber(_index: number, dayGroup: DayGroup): number {
        return dayGroup.dayNumber;
    }

    trackByPlaceId(_index: number, place: TripPlace): string {
        return place.tripPlaceId;
    }

    trackByIndex(index: number): number {
        return index;
    }
}
