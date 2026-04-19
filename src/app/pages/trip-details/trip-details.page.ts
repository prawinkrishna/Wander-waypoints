import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService } from '../../core/service/trip.service';
import { AuthService } from '../../core/service/auth.service';
import { AiService, TripExtras } from '../../core/service/ai.service';
import { MatDialog } from '@angular/material/dialog';
import { AddPlaceDialogComponent } from '../../components/add-place-dialog.component';
import { BookTripDialogComponent } from '../../components/book-trip-dialog/book-trip-dialog.component';
import { ConfirmDialogComponent } from '../../components/shared/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditTripDialogComponent } from '../../components/edit-trip-dialog/edit-trip-dialog.component';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../core/services/seo.service';
import { BRAND } from '../../core/brand.config';
interface Trip {
  tripId: string;
  title: string;
  description: string;
  origin?: string;
  destination?: string;
  startDate: string;
  endDate: string;
  visibility: string;
  userId: string;
  user?: {
    username: string;
    email: string;
  };
  places?: any[];
  likes?: number;
  comments?: any[];
  isLiked?: boolean;
  // Booking fields
  isBookable?: boolean;
  tripType?: 'solo' | 'couple' | 'group' | 'family';
  pricePerPerson?: number;
  currency?: string;
  totalSlots?: number;
  bookedSlots?: number;
  availableDates?: string[];
  inclusions?: string[];
  exclusions?: string[];
  minGroupSize?: number;
  maxGroupSize?: number;
  agency?: any;
}

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.page.html',
  styleUrls: ['./trip-details.page.scss']
})
export class TripDetailsPage implements OnInit {
  tripId: string = '';
  trip: Trip | null = null;
  isLoading = true;
  error: string | null = null;
  isOwner = false;
  currentUserId: string | null = null;

  // Comments
  newComment = '';
  isAddingComment = false;

  // AI Generation
  generatingAI = false;
  showAiChat = false;

  // Travel Guide (Trip Extras)
  tripExtras: TripExtras | null = null;
  loadingExtras = false;
  extrasError: string | null = null;
  checkedItems = new Set<string>();
  packedItems = new Set<string>();

  // Hide booking widgets unless the booking feature is enabled (public beta has it off).
  bookingEnabled = environment.featureBookingEnabled;

  // Map day filter
  mapDayFilter: number | null = null;

  get mapFilteredPlaces(): any[] {
    if (!this.trip?.places) return [];
    if (this.mapDayFilter === null) return this.trip.places;
    return this.trip.places.filter((p: any) => p.dayNumber === this.mapDayFilter);
  }

  get tripDayNumbers(): number[] {
    const days = new Set((this.trip?.places || []).map((p: any) => p.dayNumber || 1));
    return Array.from(days).sort((a: number, b: number) => a - b);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private authService: AuthService,
    private aiService: AiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private seo: SeoService,
  ) { }

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('id') || '';
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.userId || null;

    if (this.tripId) {
      this.loadTripDetails();
    } else {
      this.error = 'Invalid trip ID';
      this.isLoading = false;
    }
  }

  loadTripDetails() {
    this.isLoading = true;
    this.error = null;

    this.tripService.getTrip(this.tripId).subscribe({
      next: (trip) => {
        this.trip = trip;
        // Check both trip.userId and trip.user.userId for owner comparison
        const tripOwnerId = trip.userId || trip.user?.userId;
        this.isOwner = !!(this.currentUserId && tripOwnerId && this.currentUserId === tripOwnerId);
        this.isLoading = false;
        this.applySeoForTrip(trip);
      },
      error: (err) => {
        this.error = 'Failed to load trip details. The trip may not exist or you may not have permission to view it.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Set per-trip meta tags + JSON-LD once the data has loaded. Critical
   * for sharing — without this, every trip URL would render the generic
   * site description in Slack/WhatsApp/Twitter previews. Also injects
   * `TouristTrip` schema.org markup so Google can rich-snippet the trip.
   *
   * Note: this only runs client-side, so until SSR is added the meta
   * tags only work for users with JS-enabled browsers (Google's bot can
   * usually execute JS now, but unreliably). When SSR lands post-beta,
   * the same call sites work without modification.
   */
  private applySeoForTrip(trip: Trip): void {
    if (!trip) return;

    const destination = trip.destination || '';
    const description =
      trip.description?.slice(0, 155) ||
      `${destination ? `Explore ${destination}. ` : ''}A travel itinerary on Trekio.`;

    this.seo.setMetaTags({
      title: `${trip.title}${destination ? ` — ${destination}` : ''}`,
      description,
      path: `/trip-details/${trip.tripId}`,
      type: 'article',
      // Public trips are indexable; private trips should not be.
      noIndex: !(trip as any).isPublic,
    });

    if (!(trip as any).isPublic) {
      // Don't expose private trip data via JSON-LD even if the page
      // happens to render. The noIndex flag above already covers
      // crawlers, but structured data is fetched independently.
      return;
    }

    this.seo.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: trip.title,
      description,
      url: `${BRAND.url}/trip-details/${trip.tripId}`,
      ...(trip.user?.username
        ? {
            author: {
              '@type': 'Person',
              name: trip.user.username,
            },
          }
        : {}),
      ...(destination
        ? {
            touristType: 'leisure',
            itinerary: {
              '@type': 'ItemList',
              numberOfItems: trip.places?.length || 0,
            },
          }
        : {}),
    });
  }

  onLike() {
    if (!this.trip) return;

    this.tripService.likeTrip(this.trip.tripId).subscribe({
      next: () => {
        if (this.trip) {
          this.trip.isLiked = !this.trip.isLiked;
          this.trip.likes = (this.trip.likes || 0) + (this.trip.isLiked ? 1 : -1);
        }
      },
      error: (err) => {
      }
    });
  }

  onAddComment() {
    if (!this.trip || !this.newComment.trim()) return;

    this.isAddingComment = true;
    this.tripService.commentOnTrip(this.trip.tripId, this.newComment).subscribe({
      next: (comment) => {
        if (this.trip) {
          this.trip.comments = this.trip.comments || [];
          this.trip.comments.unshift(comment);
          this.newComment = '';
        }
        this.isAddingComment = false;
      },
      error: (err) => {
        this.isAddingComment = false;
      }
    });
  }

  onEdit() {
    if (!this.trip) return;

    const dialogRef = this.dialog.open(EditTripDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: {
        tripId: this.trip.tripId,
        title: this.trip.title,
        description: this.trip.description,
        origin: this.trip.origin,
        destination: this.trip.destination,
        startDate: this.trip.startDate,
        endDate: this.trip.endDate,
        coverImage: (this.trip as any).coverImage,
        isPublic: (this.trip as any).isPublic
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tripService.updateTrip(this.trip!.tripId, result).subscribe({
          next: () => {
            this.snackBar.open('Trip updated successfully', 'Close', { duration: 2000 });
            this.loadTripDetails();
          },
          error: (err) => {
            this.snackBar.open('Failed to update trip', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  onDelete() {
    if (!this.trip) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Trip',
        message: `Are you sure you want to delete "${this.trip.title}"? This action cannot be undone.`,
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.tripService.deleteTrip(this.trip!.tripId).subscribe({
        next: () => {
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          this.snackBar.open('Failed to delete trip. Please try again.', 'Close', { duration: 3000 });
        }
      });
    });
  }

  onShare() {
    if (!this.trip) return;

    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.trip.title,
        text: this.trip.description,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTripDuration(): string {
    if (!this.trip) return '';
    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  }



  onPlaceDeleted(tripPlaceId: string) {
    if (!this.trip) return;

    // Optimistic update: Remove the place from the local array immediately
    this.trip.places = this.trip.places?.filter(p => p.tripPlaceId !== tripPlaceId) || [];

    this.tripService.deleteTripPlace(tripPlaceId).subscribe({
      next: () => {},
      error: (err) => {
        // revert logic could happen here
        this.loadTripDetails(); // Reload to sync state if failed
      }
    });
  }

  onPlacesReordered(reorderedPlaces: any[]) {
    if (!this.trip) return;

    // Update the local trip places
    this.trip.places = reorderedPlaces;

    // Extract IDs in the new order
    const orderedIds = reorderedPlaces.map(p => p.tripPlaceId);

    this.tripService.reorderTripPlaces(this.trip.tripId, orderedIds).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  onPlaceUpdated(event: { tripPlaceId: string; data: any }) {
    this.tripService.updateTripPlace(event.tripPlaceId, event.data).subscribe({
      next: () => {
        this.snackBar.open('Place updated successfully', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to update place', 'Close', { duration: 3000 });
        this.loadTripDetails(); // Reload to revert
      }
    });
  }

  getTotalDays(): number {
    if (!this.trip) return 7;
    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  openAddPlaceDialog() {
    if (!this.trip || !this.isOwner) return;

    const dialogRef = this.dialog.open(AddPlaceDialogComponent, {
      width: '500px',
      data: {
        tripId: this.trip.tripId,
        totalDays: this.getTotalDays()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add place to trip
        this.tripService.addPlace(this.trip!.tripId, {
          placeId: null, // Will create new place
          placeName: result.place.name,
          latitude: result.place.latitude,
          longitude: result.place.longitude,
          address: result.place.address,
          dayNumber: result.dayNumber,
          timeSlot: result.timeSlot,
          order: (this.trip!.places?.length || 0) + 1,
          duration: result.duration,
          travelDuration: result.travelDuration,
          transportMode: result.transportMode,
          travelTimeFromPrev: result.travelTimeFromPrev
        }).subscribe({
          next: () => {
            this.loadTripDetails(); // Reload to show new place
          },
          error: () => {}
        });
      }
    });
  }

  generateAIItinerary() {
    if (!this.trip || !this.isOwner || this.generatingAI) return;

    this.generatingAI = true;
    const start = new Date(this.trip.startDate);
    const end = new Date(this.trip.endDate);
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    this.aiService.generateTrip({
      destination: this.trip.destination || this.trip.title,
      duration_days: durationDays,
      budget: 'Medium',
      interests: ['Exploration'],
      travel_style: 'Balanced'
    }).subscribe({
      next: (response) => {
        const tripData = response.trip || response;
        if (tripData?.itinerary?.length) {
          this.saveItineraryPlaces(tripData.itinerary, (this.trip as any).destination || this.trip!.title);
        } else {
          this.generatingAI = false;
          this.snackBar.open('AI could not generate an itinerary. Try adding places manually.', 'Close', { duration: 4000 });
        }
      },
      error: () => {
        this.generatingAI = false;
        this.snackBar.open('Failed to generate itinerary. Please try again.', 'Close', { duration: 4000 });
      }
    });
  }

  private async saveItineraryPlaces(itinerary: any[], destination: string) {
    let order = 1;

    for (const day of itinerary) {
      const dayNumber = day.day_number || day.day || 1;
      let currentTimeMinutes = 9 * 60;

      if (day.activities && Array.isArray(day.activities)) {
        for (const activity of day.activities) {
          let duration = activity.duration;
          if (!duration) {
            const name = (activity.place_name || '').toLowerCase();
            if (name.includes('museum') || name.includes('art')) duration = 90;
            else if (name.includes('restaurant') || name.includes('cafe') || name.includes('dinner') || name.includes('lunch')) duration = 60;
            else duration = 60;
          }

          const travelDuration = activity.travel_time || 30;
          const h = Math.floor(currentTimeMinutes / 60);
          const m = currentTimeMinutes % 60;
          const startTimeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

          let timeSlot = 'morning';
          if (h >= 12 && h < 17) timeSlot = 'afternoon';
          else if (h >= 17 && h < 20) timeSlot = 'evening';
          else if (h >= 20) timeSlot = 'night';

          const placeData = {
            placeName: activity.place_name || activity.name || activity.activity_title,
            notes: activity.description || activity.activity_title,
            dayNumber,
            order: order++,
            timeSlot,
            startTime: startTimeStr,
            duration,
            travelDuration,
            latitude: activity.latitude ?? 0,
            longitude: activity.longitude ?? 0,
            address: activity.address || activity.location || destination,
            transportMode: activity.transport_mode || null,
            travelTimeFromPrev: activity.travel_time || travelDuration
          };

          try {
            await this.tripService.addPlace(this.trip!.tripId, placeData).toPromise();
          } catch (err) {
            // Failed to save place - continue with remaining
          }

          currentTimeMinutes += duration + travelDuration;
        }
      }
    }

    this.generatingAI = false;
    this.snackBar.open('AI itinerary generated successfully!', 'Close', { duration: 3000 });
    this.loadTripDetails();
  }

  openBookingDialog() {
    if (!this.trip || !this.trip.isBookable) return;

    const dialogRef = this.dialog.open(BookTripDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: {
        trip: {
          tripId: this.trip.tripId,
          title: this.trip.title,
          pricePerPerson: this.trip.pricePerPerson,
          currency: this.trip.currency,
          availableDates: this.trip.availableDates,
          minGroupSize: this.trip.minGroupSize,
          maxGroupSize: this.trip.maxGroupSize,
          totalSlots: this.trip.totalSlots,
          bookedSlots: this.trip.bookedSlots
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.snackBar.open('Booking created successfully! Check your email for confirmation.', 'OK', {
          duration: 5000
        });
        this.loadTripDetails(); // Reload to update bookedSlots
        // Optionally navigate to booking details
        // this.router.navigate(['/booking', result.booking.bookingId]);
      }
    });
  }

  toggleAiChat() {
    this.showAiChat = !this.showAiChat;
  }

  generateTripExtras() {
    if (!this.trip || this.loadingExtras) return;
    this.loadingExtras = true;
    this.extrasError = null;

    const destination = this.trip.destination || '';
    const start = this.trip.startDate ? new Date(this.trip.startDate) : null;
    const end = this.trip.endDate ? new Date(this.trip.endDate) : null;
    const duration = start && end
      ? Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      : 7;

    this.aiService.generateTripExtras({
      destination,
      duration,
      origin: this.trip.origin,
      trip_type: this.trip.tripType,
    }).subscribe({
      next: (extras) => {
        this.tripExtras = extras;
        this.loadingExtras = false;
      },
      error: () => {
        this.extrasError = 'Failed to generate travel guide. Please try again.';
        this.loadingExtras = false;
      }
    });
  }

  toggleCheckedItem(key: string) {
    if (this.checkedItems.has(key)) {
      this.checkedItems.delete(key);
    } else {
      this.checkedItems.add(key);
    }
  }

  togglePackedItem(key: string) {
    if (this.packedItems.has(key)) {
      this.packedItems.delete(key);
    } else {
      this.packedItems.add(key);
    }
  }

  get checkedCount(): number {
    if (!this.tripExtras) return 0;
    const keys = Object.keys(this.tripExtras.pre_trip_checklist).filter(k => k !== 'emergency_contacts');
    return keys.filter(k => this.checkedItems.has(k)).length;
  }

  get checklistTotal(): number {
    if (!this.tripExtras) return 0;
    return Object.keys(this.tripExtras.pre_trip_checklist).filter(k => k !== 'emergency_contacts').length;
  }

  getChecklistValue(key: string): string {
    if (!this.tripExtras) return '';
    const checklist = this.tripExtras.pre_trip_checklist as Record<string, any>;
    return checklist[key] || '';
  }

  getPackingItems(key: string): string[] {
    if (!this.tripExtras) return [];
    const list = this.tripExtras.packing_list as Record<string, string[]>;
    return list[key] || [];
  }

  onAiItineraryUpdated(modifiedItinerary: any[]) {
    if (!this.trip) return;

    this.tripService.replaceItinerary(this.trip.tripId, modifiedItinerary).subscribe({
      next: () => {
        this.snackBar.open('Itinerary updated by AI!', 'Close', { duration: 3000 });
        this.loadTripDetails();
      },
      error: (err) => {
        this.snackBar.open('Failed to update itinerary. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
