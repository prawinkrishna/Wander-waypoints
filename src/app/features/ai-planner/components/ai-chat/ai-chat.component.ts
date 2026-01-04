import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AiService } from '../../../../core/service/ai.service';
import { PlannerStateService } from '../../../../core/service/planner-state.service';

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
        private plannerState: PlannerStateService
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

        // 1. Add User Message
        const msg = this.userInput;
        this.messages.push({ text: msg, isUser: true, type: 'text' });
        this.userInput = '';
        this.isLoading = true;

        // 2. Call AI Service (MOCKED for now as per user request)
        // this.aiService.generateTrip(msg).subscribe({...})

        setTimeout(() => {
            this.isLoading = false;

            const mockResponse = {
                "trip_title": "The Golden Compass: Bangkok's Historical & Urban Exploration",
                "summary": "A three-day exploration focusing on the ancient history, revered temples, and vibrant, complex culture of Thailand's capital, perfectly balanced for the discerning traveler.",
                "itinerary": [
                    {
                        "day_number": 1,
                        "theme": "Rattanakosin: Temples, Rivers, and Royal History",
                        "activities": [
                            {
                                "time_of_day": "Morning",
                                "activity_title": "The Dawn of the City: Temples and the Reclining Buddha",
                                "description": "Begin with an early visit to Wat Pho, home to the magnificent Reclining Buddha, followed by a crossing of the Chao Phraya River via ferry to admire the stunning, ceramic-inlaid spire of Wat Arun (Temple of Dawn).",
                                "place_name": "Wat Pho & Wat Arun",
                                "estimated_cost": "$$"
                            },
                            {
                                "time_of_day": "Afternoon",
                                "activity_title": "Grand Palace Perimeter and Culinary Deep Dive",
                                "description": "After a brief view of the exteriors near the Grand Palace (to save on time and high entrance cost), seek out an authentic lunch experience. Enjoy the iconic Pad Thai at a famous local spot.",
                                "place_name": "Thip Samai Pad Thai Pratu Phi",
                                "estimated_cost": "$$"
                            },
                            {
                                "time_of_day": "Evening",
                                "activity_title": "Chinatown Chaos and Street Food Feast",
                                "description": "Check out the sensory overload of Yaowarat Road.",
                                "place_name": "Yaowarat Road (Chinatown) - T&K Seafood",
                                "estimated_cost": "$$"
                            }
                        ]
                    },
                    {
                        "day_number": 2,
                        "theme": "Ayutthaya: Ancient Kingdom Exploration",
                        "activities": [
                            {
                                "time_of_day": "Morning",
                                "activity_title": "Journey to the Former Capital",
                                "description": "Take an early morning private transfer to Ayutthaya.",
                                "place_name": "Ayutthaya Historical Park",
                                "estimated_cost": "$$$"
                            }
                        ]
                    }
                ]
            };

            // 3. Update the Shared State (Trip Canvas)
            this.plannerState.updateTrip(mockResponse);

            // 4. Add simple confirmation message
            this.messages.push({
                text: `I've created a trip to ${mockResponse.trip_title}. Check the itinerary on the right!`,
                isUser: false,
                type: 'text'
            });
        }, 1500);
    }
}
