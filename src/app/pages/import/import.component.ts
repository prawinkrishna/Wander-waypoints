import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AiService, ExtractedPlace, ExtractionResponse } from '../../core/service/ai.service';
import { TripService } from '../../core/service/trip.service';

type ImportState = 'idle' | 'extracting' | 'review' | 'saving' | 'error';

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

  // Existing trip to add places to (from query params)
  existingTripId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aiService: AiService,
    private tripService: TripService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.existingTripId = this.route.snapshot.queryParamMap.get('tripId');
  }

  get selectedCount(): number {
    return this.places.filter(p => p.selected).length;
  }

  onPaste(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || '';
    if (pasted && (pasted.includes('youtube.com') || pasted.includes('youtu.be') || pasted.includes('instagram.com'))) {
      // Auto-submit after paste
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

  onRetry() {
    this.state = 'idle';
    this.errorMessage = '';
  }

  onBack() {
    this.state = 'idle';
    this.places = [];
    this.sourceTitle = '';
  }

  async onCreateTrip() {
    const selected = this.places.filter(p => p.selected);
    if (selected.length === 0) return;

    this.state = 'saving';

    try {
      let tripId = this.existingTripId;

      if (!tripId) {
        // Create a new trip
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 7);

        const tripData = {
          title: this.sourceTitle || 'Imported Trip',
          description: `Imported from ${this.url}`,
          origin: 'Imported',
          destination: selected[0]?.name || 'Unknown',
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          isPublic: false
        };

        const trip = await this.tripService.createTrip(tripData).toPromise();
        tripId = trip.tripId;
      }

      // Add each selected place to the trip
      let order = 1;
      for (const place of selected) {
        const placeData = {
          placeName: place.name,
          notes: place.description,
          dayNumber: 1,
          order: order++,
          timeSlot: this.getCategoryTimeSlot(place.category),
          duration: 60,
          travelDuration: 30,
          latitude: 0,
          longitude: 0,
          address: place.name
        };

        try {
          await this.tripService.addPlace(tripId!, placeData).toPromise();
        } catch (err) {
          console.error(`Failed to save place ${place.name}:`, err);
        }
      }

      this.snackBar.open(`${selected.length} places imported successfully!`, 'Close', { duration: 3000 });
      this.router.navigate(['/trip-details', tripId]);
    } catch (err) {
      console.error('Error creating trip:', err);
      this.state = 'error';
      this.errorMessage = 'Failed to create trip. Please try again.';
    }
  }

  private getCategoryTimeSlot(category: string): string {
    switch (category?.toLowerCase()) {
      case 'food': return 'afternoon';
      case 'stay': return 'evening';
      default: return 'morning';
    }
  }
}
