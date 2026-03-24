import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgentService, AgentTripResponse, AgentTripPreferences } from '../../../core/service/agent.service';

@Component({
    selector: 'app-create-itinerary',
    templateUrl: './create-itinerary.component.html',
    styleUrls: ['./create-itinerary.component.scss']
})
export class CreateItineraryComponent implements OnInit {
    tripForm!: FormGroup;
    isGenerating = false;
    isSaving = false;
    generatedItinerary: AgentTripResponse | null = null;
    showPreview = false;

    tripTypes = [
        { value: 'solo', label: 'Solo' },
        { value: 'couple', label: 'Couple' },
        { value: 'family', label: 'Family' },
        { value: 'group', label: 'Group' }
    ];

    budgetCategories = [
        { value: 'budget', label: 'Budget (Economy)' },
        { value: 'mid-range', label: 'Mid-Range (Comfort)' },
        { value: 'luxury', label: 'Luxury (Premium)' }
    ];

    interestOptions = [
        'Adventure', 'Beach', 'Culture', 'Food', 'History',
        'Nature', 'Nightlife', 'Photography', 'Relaxation',
        'Shopping', 'Sightseeing', 'Sports', 'Wildlife'
    ];

    constructor(
        private fb: FormBuilder,
        private agentService: AgentService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);

        this.tripForm = this.fb.group({
            // Client Info
            clientName: ['', Validators.required],
            clientEmail: ['', [Validators.email]],
            clientPhone: [''],

            // Trip Details
            destination: ['', Validators.required],
            startDate: [tomorrow, Validators.required],
            duration: [3, [Validators.required, Validators.min(1), Validators.max(30)]],
            travelers: [2, [Validators.required, Validators.min(1), Validators.max(50)]],

            // Preferences
            tripType: ['couple'],
            budgetCategory: ['mid-range'],
            interests: [[]],
            specialRequirements: ['']
        });
    }

    get selectedInterests(): string[] {
        return this.tripForm.get('interests')?.value || [];
    }

    toggleInterest(interest: string) {
        const interests = [...this.selectedInterests];
        const index = interests.indexOf(interest);
        if (index > -1) {
            interests.splice(index, 1);
        } else {
            interests.push(interest);
        }
        this.tripForm.patchValue({ interests });
    }

    generateItinerary() {
        if (this.tripForm.invalid) {
            this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.isGenerating = true;
        this.generatedItinerary = null;

        const formValue = this.tripForm.value;
        const preferences: AgentTripPreferences = {
            destination: formValue.destination,
            duration: formValue.duration,
            budgetCategory: formValue.budgetCategory,
            tripType: formValue.tripType,
            interests: formValue.interests,
            clientName: formValue.clientName,
            travelers: formValue.travelers,
            startDate: formValue.startDate?.toISOString?.() || formValue.startDate,
            specialRequirements: formValue.specialRequirements
        };

        this.agentService.generateItinerary(preferences).subscribe({
            next: (response) => {
                this.generatedItinerary = response;
                this.showPreview = true;
                this.isGenerating = false;
                this.snackBar.open('Itinerary generated successfully!', 'Close', { duration: 3000 });
            },
            error: (error) => {
                console.error('Generation error:', error);
                this.isGenerating = false;
                this.snackBar.open('Failed to generate itinerary. Please try again.', 'Close', { duration: 5000 });
            }
        });
    }

    saveAndEdit() {
        if (!this.generatedItinerary) return;

        this.isSaving = true;

        const formValue = this.tripForm.value;
        const startDate = new Date(formValue.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + formValue.duration - 1);

        // Create the trip first
        const tripData = {
            title: this.generatedItinerary.trip_title,
            description: this.generatedItinerary.summary,
            origin: 'TBD', // Currently no origin in form, defaulting to TBD
            destination: formValue.destination,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            isPublic: false,
            tripType: formValue.tripType,
            clientName: formValue.clientName,
            clientEmail: formValue.clientEmail,
            clientPhone: formValue.clientPhone,
            inclusions: this.generatedItinerary.inclusions,
            exclusions: this.generatedItinerary.exclusions,
            specialNotes: this.generatedItinerary.travel_tips?.join('\n'),
            accommodations: this.generatedItinerary.recommended_hotels.map(h => ({
                hotelName: h.hotel_name,
                starRating: h.star_rating,
                roomType: h.room_type,
                perNightCost: h.per_night_cost,
                checkIn: startDate.toISOString().split('T')[0],
                checkOut: endDate.toISOString().split('T')[0],
                nights: formValue.duration - 1,
                totalCost: (h.per_night_cost || 0) * (formValue.duration - 1)
            })),
            transportSegments: this.generatedItinerary.transport_suggestions.map(t => ({
                type: t.type,
                route: t.route,
                date: startDate.toISOString().split('T')[0],
                operator: t.recommended_operator,
                cost: t.estimated_cost
            })),
            pricingBreakdown: this.generatedItinerary.budget_breakdown.map(b => ({
                item: b.category,
                description: b.description,
                quantity: b.quantity,
                unitPrice: b.unit_price,
                total: b.total
            })),
            totalCost: this.generatedItinerary.estimated_total,
            grandTotal: this.generatedItinerary.estimated_total
        };

        this.agentService.createItinerary(tripData).subscribe({
            next: (trip) => {
                // Save the itinerary places
                this.saveItineraryPlaces(trip.tripId, this.generatedItinerary!);
            },
            error: (error) => {
                console.error('Save error:', error);
                this.isSaving = false;
                this.snackBar.open('Failed to save itinerary', 'Close', { duration: 5000 });
            }
        });
    }

    private saveItineraryPlaces(tripId: string, itinerary: AgentTripResponse) {
        const places: any[] = [];
        let order = 0;

        for (const day of itinerary.itinerary) {
            for (const activity of day.activities) {
                places.push({
                    tripId,
                    dayNumber: day.day_number,
                    startTime: activity.start_time,
                    order: order++,
                    timeSlot: this.getTimeSlot(activity.start_time),
                    duration: this.calculateDuration(activity.start_time, activity.end_time),
                    notes: activity.description,
                    // Flat properties expected by backend DTO
                    placeName: activity.place_name,
                    address: activity.place_address || ''
                });
            }
        }

        // Save places sequentially
        this.savePlacesSequentially(tripId, places, 0);
    }

    private savePlacesSequentially(tripId: string, places: any[], index: number) {
        if (index >= places.length) {
            this.isSaving = false;
            this.router.navigate(['/studio/edit-itinerary', tripId]);
            return;
        }

        this.agentService.addTripPlace(tripId, places[index]).subscribe({
            next: () => {
                this.savePlacesSequentially(tripId, places, index + 1);
            },
            error: (error) => {
                console.error('Error saving place:', error);
                this.savePlacesSequentially(tripId, places, index + 1);
            }
        });
    }

    private getTimeSlot(time: string): string {
        const hour = parseInt(time.split(':')[0], 10);
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        if (hour < 20) return 'evening';
        return 'night';
    }

    private calculateDuration(start: string, end: string): number {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        return (endH * 60 + endM) - (startH * 60 + startM);
    }

    formatCurrency(amount: number | undefined): string {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    resetForm() {
        this.generatedItinerary = null;
        this.showPreview = false;
        this.initForm();
    }
}
