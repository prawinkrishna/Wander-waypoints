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

        // 2. Call AI Service
        this.aiService.generateTrip(msg).subscribe({
            next: (response) => {
                this.isLoading = false;

                // Handle the response - could be direct object or wrapped
                const tripData = response.trip || response;

                // 3. Update the Shared State (Trip Canvas)
                if (tripData && (tripData.trip_title || tripData.itinerary)) {
                    this.plannerState.updateTrip(tripData);

                    // 4. Add confirmation message
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
}
