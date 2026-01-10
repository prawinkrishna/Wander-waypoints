import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TripService } from '../core/service/trip.service';
import { AuthService } from '../core/service/auth.service';
import { AiService } from '../core/service/ai.service';
import { AskAiDialogComponent } from '../components/ask-ai-dialog.component';

@Component({
  selector: 'app-create-trip',
  templateUrl: './create-trip.component.html',
  styleUrls: ['./create-trip.component.scss']
})
export class CreateTripComponent implements OnInit {
  tripForm!: FormGroup;
  submitting = false;
  errorMessage = '';
  isEditMode = false;
  tripId: string | null = null;
  loadingTrip = false;

  // Date constraints
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private authService: AuthService,
    private aiService: AiService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.initForm();

    // Check for edit mode
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'edit' && params['id']) {
        this.isEditMode = true;
        this.tripId = params['id'];
        this.loadTripData(this.tripId!);
      }
    });
  }

  loadTripData(id: string) {
    this.loadingTrip = true;
    this.tripService.getTrip(id).subscribe({
      next: (trip) => {
        this.tripForm.patchValue({
          title: trip.title,
          description: trip.description,
          origin: trip.origin,
          destination: trip.destination,
          startDate: new Date(trip.startDate),
          endDate: new Date(trip.endDate),
          coverImage: trip.coverImage,
          isPublic: trip.isPublic
        });
        this.loadingTrip = false;
      },
      error: (err) => {
        console.error('Error loading trip:', err);
        this.errorMessage = 'Failed to load trip details.';
        this.loadingTrip = false;
      }
    });
  }

  initForm() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.tripForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      startDate: [today, Validators.required],
      endDate: [nextWeek, Validators.required],
      coverImage: [''],
      isPublic: [true]
    });
  }

  get f() {
    return this.tripForm.controls;
  }

  onSubmit() {
    if (this.tripForm.invalid) return;

    this.submitting = true;
    this.errorMessage = '';

    const formData = this.tripForm.value;
    const currentUser = this.authService.getCurrentUser();

    const tripData = {
      ...formData,
      startDate: this.formatDate(formData.startDate),
      endDate: this.formatDate(formData.endDate),
      userId: currentUser?.userId
    };

    if (this.isEditMode && this.tripId) {
      this.updateTrip(this.tripId, tripData);
    } else {
      this.createTrip(tripData);
    }
  }

  updateTrip(id: string, data: any) {
    this.tripService.updateTrip(id, data).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/trip-details', id]);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Failed to update trip. Please try again.';
      }
    });
  }

  createTrip(data: any) {
    this.tripService.createTrip(data).subscribe({
      next: (response) => {
        this.submitting = false;
        // Show dialog asking about AI generation
        this.showAskAiDialog(response, this.tripForm.value);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Failed to create trip. Please try again.';
        console.error('Create trip error:', err);
      }
    });
  }

  showAskAiDialog(trip: any, formData: any) {
    const dialogRef = this.dialog.open(AskAiDialogComponent, {
      width: '450px',
      disableClose: true,
      data: {
        tripId: trip.tripId,
        destination: formData.destination,
        startDate: this.formatDate(formData.startDate),
        endDate: this.formatDate(formData.endDate)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.useAI) {
        // Generate itinerary with AI then navigate
        this.generateWithAI(trip.tripId, formData);
      } else {
        // Navigate directly to trip details
        this.router.navigate(['/trip-details', trip.tripId]);
      }
    });
  }

  generateWithAI(tripId: string, formData: any) {
    const prompt = `Create a detailed travel itinerary for a trip to ${formData.destination} from ${this.formatDate(formData.startDate)} to ${this.formatDate(formData.endDate)}. Include popular attractions, restaurants, and activities.`;

    this.aiService.generateTrip(prompt).subscribe({
      next: (response) => {
        // Save the generated itinerary to the trip
        if (response?.itinerary) {
          this.tripService.saveItinerary(tripId, response.itinerary).subscribe({
            next: () => this.router.navigate(['/trip-details', tripId]),
            error: () => this.router.navigate(['/trip-details', tripId])
          });
        } else {
          this.router.navigate(['/trip-details', tripId]);
        }
      },
      error: () => {
        // Even if AI fails, still navigate to trip
        this.router.navigate(['/trip-details', tripId]);
      }
    });
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onCancel() {
    this.router.navigate(['/home']);
  }
}
