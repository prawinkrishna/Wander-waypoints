import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AiService } from '../../../../core/service/ai.service';
import { PlannerStateService } from '../../../../core/service/planner-state.service';
import { TripService } from '../../../../core/service/trip.service';
import { AuthService } from '../../../../core/service/auth.service';

@Component({
    selector: 'app-ai-chat',
    templateUrl: './ai-chat.component.html',
    styleUrls: ['./ai-chat.component.scss']
})
export class AiChatComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    messages: { text: string; isUser: boolean; type: 'text' | 'trip-card'; data?: any }[] = [
        { text: "Hi! I'm your AI Travel Concierge. Where would you like to go?", isUser: false, type: 'text' }
    ];
    userInput: string = '';
    isLoading: boolean = false;

    constructor(
        private aiService: AiService,
        private plannerState: PlannerStateService,
        private tripService: TripService,
        private authService: AuthService
    ) { }

    ngOnInit(): void { }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    sendMessage() {
        if (!this.userInput.trim()) return;

        // 1. Guest Check
        if (!this.authService.isAuthenticatedUser()) {
            this.messages.push({
                text: "Please login to create an AI-generated trip. It takes just a few seconds!",
                isUser: false,
                type: 'text'
            });
            // Optional: Redirect to login or show snackbar
            // this.router.navigate(['/login']); 
            return;
        }

        // 2. Add User Message
        const msg = this.userInput;
        this.messages.push({ text: msg, isUser: true, type: 'text' });
        this.userInput = '';
        this.isLoading = true;

        // 3. Call AI Service
        this.aiService.generateTrip(msg).subscribe({
            next: (response) => {
                this.isLoading = false;

                // Handle the response - could be direct object or wrapped
                const tripData = response.trip || response;

                // 4. Update the Shared State (Trip Canvas)
                if (tripData && (tripData.trip_title || tripData.itinerary)) {
                    this.plannerState.updateTrip(tripData);

                    // 5. Auto-save trip to database
                    this.saveTripToDatabase(tripData);

                    // 6. Add confirmation message
                    this.messages.push({
                        text: `I've created "${tripData.trip_title || 'your trip'}". Check the itinerary on the right!`,
                        isUser: false,
                        type: 'text'
                    });
                } else if (response.message) {
                    // AI returned a text message instead of trip
                    this.messages.push({
                        text: response.message,
                        isUser: false,
                        type: 'text'
                    });
                } else {
                    this.messages.push({
                        text: "I've processed your request. Check the canvas for details!",
                        isUser: false,
                        type: 'text'
                    });
                }
            },
            error: (err) => {
                this.isLoading = false;
                console.error('AI Service Error:', err);

                this.messages.push({
                    text: "Sorry, I couldn't process that request. Please try again or rephrase your query.",
                    isUser: false,
                    type: 'text'
                });
            }
        });
    }

    /**
     * Save AI-generated trip to database
     */
    private saveTripToDatabase(tripData: any): void {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
            console.error('Cannot save trip: User not logged in');
            return;
        }

        // Extract trip details from AI response
        const today = new Date();
        const duration = tripData.duration_days || tripData.itinerary?.length || 3;
        const endDate = new Date(today.getTime() + duration * 24 * 60 * 60 * 1000);

        const tripPayload = {
            title: tripData.trip_title || tripData.destination || 'AI Generated Trip',
            description: tripData.description || `Explore ${tripData.destination || 'this destination'} with this AI-curated itinerary.`,
            origin: 'Various',
            destination: tripData.destination || tripData.trip_title || 'Destination',
            startDate: today.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            isPublic: true,
            userId: currentUser.userId // IMPORTANT: Associate with user
        };

        this.tripService.createTrip(tripPayload).subscribe({
            next: (savedTrip) => {
                console.log('Trip saved to database:', savedTrip.tripId);

                // Save itinerary places sequentially
                if (tripData.itinerary && tripData.itinerary.length > 0) {
                    const destination = tripData.destination || tripData.trip_title || 'Unknown';
                    this.saveItineraryPlaces(savedTrip.tripId, tripData.itinerary, destination);
                }
            },
            error: (err) => {
                console.error('Failed to save trip to database:', err);
            }
        });
    }

    /**
     * Save itinerary places to the trip sequentially
     */
    private async saveItineraryPlaces(tripId: string, itinerary: any[], destination: string) {
        let order = 1;

        for (const day of itinerary) {
            const dayNumber = day.day_number || day.day || 1;

            // Reset start time for each day (e.g., 9:00 AM)
            let currentTimeMinutes = 9 * 60;

            if (day.activities && Array.isArray(day.activities)) {
                for (const activity of day.activities) {
                    // Try to guess default duration if missing (Smart Defaults)
                    let duration = activity.duration;
                    if (!duration) {
                        const name = (activity.place_name || '').toLowerCase();
                        if (name.includes('museum') || name.includes('art')) duration = 90;
                        else if (name.includes('restaurant') || name.includes('cafe') || name.includes('dinner') || name.includes('lunch')) duration = 60;
                        else duration = 60;
                    }

                    const travelDuration = activity.travel_time || 30; // Default 30 mins travel

                    // Format start time string (e.g. "09:30")
                    const h = Math.floor(currentTimeMinutes / 60);
                    const m = currentTimeMinutes % 60;
                    const startTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

                    // Determine Time Slot
                    let timeSlot = 'morning';
                    if (h >= 12 && h < 17) timeSlot = 'afternoon';
                    else if (h >= 17 && h < 20) timeSlot = 'evening';
                    else if (h >= 20) timeSlot = 'night';

                    const placeData = {
                        placeName: activity.place_name || activity.name || activity.activity_title,
                        notes: activity.description || activity.activity_title,
                        dayNumber: dayNumber,
                        order: order++,
                        timeSlot: timeSlot,
                        startTime: startTimeStr,
                        duration: duration,
                        travelDuration: travelDuration,

                        // Provide default coordinates - backend requires these
                        latitude: activity.latitude || 0,
                        longitude: activity.longitude || 0,
                        address: activity.address || activity.location || destination
                    };

                    try {
                        await this.tripService.addPlace(tripId, placeData).toPromise();
                    } catch (err) {
                        console.error(`Failed to save place ${placeData.placeName}:`, err);
                    }

                    // Advance time for next activity
                    currentTimeMinutes += duration + travelDuration;
                }
            }
        }
        console.log('All itinerary places saved successfully');
    }
}
