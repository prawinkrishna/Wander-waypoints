import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { AiService, ChatMessage, ModifyTripRequest } from '../../core/service/ai.service';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  changesSummary?: string[];
  timestamp: Date;
}

@Component({
  selector: 'app-ai-trip-chat',
  templateUrl: './ai-trip-chat.component.html',
  styleUrls: ['./ai-trip-chat.component.scss']
})
export class AiTripChatComponent implements AfterViewChecked {
  @Input() trip: any;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() itineraryUpdated = new EventEmitter<any[]>();

  @ViewChild('chatMessages') chatMessagesEl!: ElementRef;

  messages: DisplayMessage[] = [];
  newMessage = '';
  isProcessing = false;
  private shouldScroll = false;

  suggestions = [
    'Add more food spots',
    'Make it less packed',
    'Add free activities',
    'Rearrange for better flow',
    'Add a beach day',
    'More cultural experiences'
  ];

  constructor(private aiService: AiService) {}

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  sendMessage(text?: string) {
    const message = text || this.newMessage.trim();
    if (!message || this.isProcessing || !this.trip) return;

    // Add user message
    this.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    this.newMessage = '';
    this.isProcessing = true;
    this.shouldScroll = true;

    // Build context from current trip places
    const context = this.buildItineraryContext();

    // Build conversation history (last 10 messages)
    const conversationHistory: ChatMessage[] = this.messages
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    const request: ModifyTripRequest = {
      context,
      user_message: message,
      conversation_history: conversationHistory,
      budget: 'medium',
      travel_style: 'balanced'
    };

    this.aiService.modifyTrip(request).subscribe({
      next: (response) => {
        this.messages.push({
          role: 'assistant',
          content: response.message,
          changesSummary: response.changes_summary,
          timestamp: new Date()
        });
        this.isProcessing = false;
        this.shouldScroll = true;

        // Emit the modified itinerary for the parent to save
        if (response.modified_itinerary?.length) {
          this.itineraryUpdated.emit(response.modified_itinerary);
        }
      },
      error: (err) => {
        console.error('AI modify error:', err);
        this.messages.push({
          role: 'assistant',
          content: 'Sorry, I had trouble processing that request. Please try again.',
          timestamp: new Date()
        });
        this.isProcessing = false;
        this.shouldScroll = true;
      }
    });
  }

  private buildItineraryContext() {
    const places = this.trip.places || [];
    const dayMap = new Map<number, any[]>();

    places.forEach((p: any) => {
      const day = p.dayNumber || 1;
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day)!.push(p);
    });

    const currentItinerary = Array.from(dayMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([dayNumber, dayPlaces]) => ({
        day_number: dayNumber,
        theme: '',
        activities: dayPlaces
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
          .map((p: any) => ({
            place_name: p.place?.name || p.placeName || 'Unknown',
            description: p.notes || p.place?.description || '',
            time_of_day: p.timeSlot || 'morning',
            start_time: p.startTime || '',
            duration: p.duration || 60,
            category: p.place?.category || 'Activity',
            transport_mode: p.transportMode || null,
            travel_time: p.travelTimeFromPrev || null
          }))
      }));

    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    return {
      destination: this.trip.destination || this.trip.title,
      duration_days: durationDays,
      trip_title: this.trip.title,
      current_itinerary: currentItinerary
    };
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onClose() {
    this.close.emit();
  }

  private scrollToBottom() {
    try {
      if (this.chatMessagesEl) {
        this.chatMessagesEl.nativeElement.scrollTop = this.chatMessagesEl.nativeElement.scrollHeight;
      }
    } catch (e) {}
  }
}
