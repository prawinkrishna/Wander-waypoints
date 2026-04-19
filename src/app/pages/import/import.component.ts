import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AiService, ExtractedPlace, ExtractionResponse } from '../../core/service/ai.service';
import { TripService } from '../../core/service/trip.service';
import { SavedPlaceService } from '../../core/service/saved-place.service';

type ImportState = 'idle' | 'extracting' | 'review' | 'planning' | 'saving' | 'error';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  state: ImportState = 'idle';
  url = '';
  errorMessage = '';

  // Extraction result
  sourceTitle = '';
  places: (ExtractedPlace & { selected: boolean })[] = [];
  allSelected = true;

  // Planning step (before AI generation)
  tripDestination = '';
  tripDays = 3;

  // Existing trip to add places to (from query params)
  existingTripId: string | null = null;

  // Track which places have been saved for later (by place name)
  savedPlaceIds = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aiService: AiService,
    private tripService: TripService,
    private savedPlaceService: SavedPlaceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.existingTripId = this.route.snapshot.queryParamMap.get('tripId');
  }

  get selectedCount(): number {
    return this.places.filter(p => p.selected).length;
  }

  get suggestedDays(): number {
    return Math.min(Math.max(1, Math.ceil(this.selectedCount / 3)), 14);
  }

  onPaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || '';
    if (pasted && (pasted.includes('youtube.com') || pasted.includes('youtu.be') || pasted.includes('instagram.com'))) {
      setTimeout(() => this.onExtract(), 100);
    }
  }

  onExtract() {
    const trimmed = this.url.trim();
    if (!trimmed) return;

    this.state = 'extracting';
    this.errorMessage = '';

    this.aiService.extractPlaces(trimmed).subscribe({
      next: (response: ExtractionResponse) => {
        this.sourceTitle = response.video_title;
        this.places = response.places.map(p => ({ ...p, selected: true }));
        this.allSelected = true;
        this.state = this.places.length > 0 ? 'review' : 'error';
        if (this.places.length === 0) {
          this.errorMessage = 'No travel places found in this content. Try a different URL.';
        }
      },
      error: (err) => {
        this.state = 'error';
        this.errorMessage = err.error?.detail || err.error?.message || 'Failed to extract places. Please check the URL and try again.';
      }
    });
  }

  toggleAll() {
    this.allSelected = !this.allSelected;
    this.places.forEach(p => p.selected = this.allSelected);
  }

  onPlaceToggle() {
    this.allSelected = this.places.every(p => p.selected);
  }

  onSavePlace(place: ExtractedPlace & { selected: boolean }, event: Event) {
    event.stopPropagation();
    const key = place.name;
    if (this.savedPlaceIds.has(key)) return;

    this.savedPlaceService.savePlace({
      name: place.name,
      category: place.category,
      description: place.description,
      reasonToVisit: place.reason_to_visit,
      sourceUrl: this.url,
      sourceVideoTitle: this.sourceTitle,
      sourcePlatform: this.url.includes('youtube') || this.url.includes('youtu.be') ? 'youtube' : 'instagram'
    }).subscribe({
      next: () => {
        this.savedPlaceIds.add(key);
        this.snackBar.open(`"${place.name}" saved for later`, 'Close', { duration: 2500 });
      },
      error: () => {
        this.snackBar.open('Could not save place. Please try again.', 'Close', { duration: 2000 });
      }
    });
  }

  onRetry() {
    this.state = 'idle';
    this.errorMessage = '';
  }

  onBack() {
    if (this.state === 'planning') {
      this.state = 'review';
    } else {
      this.state = 'idle';
      this.places = [];
      this.sourceTitle = '';
    }
  }

  /** Called when user clicks "Create Trip with X places" from the review step. */
  onCreateTrip() {
    const selected = this.places.filter(p => p.selected);
    if (selected.length === 0) return;

    if (this.existingTripId) {
      // Adding to an existing trip — use AI to plan extra days
      this.onGenerateWithAI();
      return;
    }

    // New trip — show planning step to collect destination + days
    this.tripDestination = this.parseDestinationFromTitle(this.sourceTitle);
    this.tripDays = this.suggestedDays;
    this.state = 'planning';
  }

  /** Called from the planning step when user confirms and hits Generate. */
  async onGenerateWithAI() {
    const selected = this.places.filter(p => p.selected);
    if (selected.length === 0) return;

    const destination = this.existingTripId ? (selected[0]?.name || 'Trip') : this.tripDestination.trim();
    if (!destination) return;

    this.state = 'saving';

    try {
      let tripId = this.existingTripId;

      if (!tripId) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + this.tripDays - 1);

        const tripData = {
          title: this.sourceTitle || `${destination} Trip`,
          description: `Imported from ${this.url}`,
          origin: 'Imported',
          destination,
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          isPublic: false
        };

        const trip = await this.tripService.createTrip(tripData).toPromise();
        tripId = trip.tripId;
      }

      // Call the AI planning pipeline with the extracted places
      const aiResponse = await this.aiService.generateTripV2({
        destination,
        duration_days: this.tripDays,
        extracted_places: selected.map(p => ({
          name: p.name,
          category: p.category,
          description: p.description,
          reason_to_visit: p.reason_to_visit
        })),
        travel_style: 'balanced',
        budget: 'medium',
        interests: [],
      }).toPromise();

      const itinerary = aiResponse?.itinerary || [];

      if (itinerary.length > 0) {
        await this.saveItineraryPlaces(tripId!, itinerary, destination);
      } else {
        this.snackBar.open('Trip created!', 'Close', { duration: 3000 });
        this.router.navigate(['/trip-details', tripId]);
      }
    } catch (err: any) {
      console.error('AI trip generation failed:', err);
      this.state = 'error';
      this.errorMessage = err.error?.detail || 'Failed to generate itinerary. Please try again.';
    }
  }

  private async saveItineraryPlaces(tripId: string, itinerary: any[], destination: string) {
    let order = 1;

    for (const day of itinerary) {
      const dayNumber = day.day_number || day.day || 1;
      let currentTimeMinutes = 9 * 60;

      if (day.activities && Array.isArray(day.activities)) {
        for (const activity of day.activities) {
          const duration = activity.duration || this.estimateDuration(activity);
          const travelDuration = activity.travel_time || 30;

          const h = Math.floor(currentTimeMinutes / 60);
          const m = currentTimeMinutes % 60;
          const startTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

          let timeSlot = 'morning';
          if (h >= 12 && h < 17) timeSlot = 'afternoon';
          else if (h >= 17 && h < 20) timeSlot = 'evening';
          else if (h >= 20) timeSlot = 'night';

          const placeData = {
            placeName: activity.place_name || activity.activity_title,
            notes: activity.description || activity.activity_title,
            dayNumber,
            order: order++,
            timeSlot,
            startTime: startTimeStr,
            duration,
            travelDuration,
            latitude: activity.latitude ?? 0,
            longitude: activity.longitude ?? 0,
            address: activity.address || destination,
            transportMode: activity.transport_mode || null,
            travelTimeFromPrev: activity.travel_time || travelDuration
          };

          try {
            await this.tripService.addPlace(tripId, placeData).toPromise();
          } catch (err) {
            console.error(`Failed to save place ${placeData.placeName}:`, err);
          }

          currentTimeMinutes += duration + travelDuration;
        }
      }
    }

    this.snackBar.open('Trip created with AI-planned itinerary!', 'Close', { duration: 4000 });
    this.router.navigate(['/trip-details', tripId]);
  }

  private estimateDuration(activity: any): number {
    const text = ((activity.place_name || '') + ' ' + (activity.category || '')).toLowerCase();
    if (/national park|wildlife|forest|reserve/.test(text)) return 240;
    if (/theme park|water park|amusement/.test(text)) return 300;
    if (/museum|gallery|art|heritage/.test(text)) return 120;
    if (/beach|lake|waterfall/.test(text)) return 120;
    if (/palace|fort|castle|monument/.test(text)) return 90;
    if (/market|shopping|bazaar/.test(text)) return 90;
    if (/restaurant|cafe|dinner|lunch|food/.test(text)) return 75;
    if (/temple|shrine|mosque|church|pagoda/.test(text)) return 45;
    if (/viewpoint|lookout|observation/.test(text)) return 30;
    return 60;
  }

  private parseDestinationFromTitle(title: string): string {
    // "Thailand Travel Guide 🇹🇭 | Pattaya & Bangkok Tour | 5 Days" -> "Thailand"
    const clean = title.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();
    const firstPart = clean.split(/\||:/)[0] || clean;
    return firstPart
      .replace(/travel guide|travel vlog|tour|complete guide|ultimate|itinerary|\d+ days?/gi, '')
      .replace(/[&+]/g, ',')
      .trim();
  }
}
