import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TripService } from '../../core/service/trip.service';
import { AuthService } from '../../core/service/auth.service';
import { AiService } from '../../core/service/ai.service';
import { WizardStep } from './models/wizard-step.model';
import { WIZARD_STEPS } from './config/wizard-steps.config';
import { wizardSlideAnimation } from './animations/wizard.animations';

@Component({
  selector: 'app-create-trip',
  templateUrl: './create-trip.component.html',
  styleUrls: ['./create-trip.component.scss'],
  animations: [wizardSlideAnimation]
})
export class CreateTripComponent implements OnInit {
  tripForm!: FormGroup;
  submitting = false;
  generatingAI = false;
  errorMessage = '';
  isEditMode = false;
  tripId: string | null = null;
  loadingTrip = false;

  allSteps: WizardStep[] = WIZARD_STEPS;
  activeSteps: WizardStep[] = [];
  currentStepIndex = 0;

  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private authService: AuthService,
    private aiService: AiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initForm();
    this.recomputeActiveSteps();

    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'edit' && params['id']) {
        this.isEditMode = true;
        this.tripId = params['id'];
        this.loadTripData(this.tripId!);
      }
    });
  }

  initForm() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.tripForm = this.fb.group({
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      startDate: [today, Validators.required],
      endDate: [nextWeek, Validators.required],
      tripType: ['solo', Validators.required],
      budget: ['medium', Validators.required],
      travelStyle: ['balanced', Validators.required],
      transportPreference: ['mix'],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      coverImage: [''],
      isPublic: [true],
      useAI: [true]
    });
  }

  get f() {
    return this.tripForm.controls;
  }

  recomputeActiveSteps() {
    const formValue = this.tripForm?.value || {};
    this.activeSteps = this.allSteps.filter(
      step => !step.condition || step.condition(formValue)
    );
    if (this.currentStepIndex >= this.activeSteps.length) {
      this.currentStepIndex = Math.max(0, this.activeSteps.length - 1);
    }
  }

  get currentStep(): WizardStep {
    return this.activeSteps[this.currentStepIndex];
  }

  get progressPercent(): number {
    if (this.activeSteps.length <= 1) return 100;
    return ((this.currentStepIndex + 1) / this.activeSteps.length) * 100;
  }

  get isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }

  get isLastStep(): boolean {
    return this.currentStepIndex === this.activeSteps.length - 1;
  }

  isCurrentStepValid(): boolean {
    const step = this.currentStep;
    if (!step) return false;

    for (const field of step.fields) {
      if (field.type === 'location-pair') {
        const originCtrl = this.tripForm.get('origin');
        const destCtrl = this.tripForm.get('destination');
        if (originCtrl?.invalid || destCtrl?.invalid) return false;
      } else if (field.type === 'date-range') {
        const startCtrl = this.tripForm.get('startDate');
        const endCtrl = this.tripForm.get('endDate');
        if (startCtrl?.invalid || endCtrl?.invalid) return false;
      } else {
        const ctrl = this.tripForm.get(field.key);
        if (ctrl && ctrl.invalid) return false;
      }
    }
    return true;
  }

  markCurrentStepTouched() {
    const step = this.currentStep;
    if (!step) return;

    for (const field of step.fields) {
      if (field.type === 'location-pair') {
        this.tripForm.get('origin')?.markAsTouched();
        this.tripForm.get('destination')?.markAsTouched();
      } else if (field.type === 'date-range') {
        this.tripForm.get('startDate')?.markAsTouched();
        this.tripForm.get('endDate')?.markAsTouched();
      } else {
        this.tripForm.get(field.key)?.markAsTouched();
      }
    }
  }

  goNext() {
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepTouched();
      return;
    }
    if (!this.isLastStep) {
      this.currentStepIndex++;
      this.recomputeActiveSteps();
    }
  }

  goBack() {
    if (!this.isFirstStep) {
      this.currentStepIndex--;
      this.recomputeActiveSteps();
    }
  }

  goToStep(index: number) {
    if (this.isEditMode || index <= this.currentStepIndex) {
      this.currentStepIndex = index;
      this.recomputeActiveSteps();
    }
  }

  isStepCompleted(index: number): boolean {
    return index < this.currentStepIndex;
  }

  isStepClickable(index: number): boolean {
    return this.isEditMode || index <= this.currentStepIndex;
  }

  selectCardOption(fieldKey: string, value: string) {
    this.tripForm.get(fieldKey)?.setValue(value);
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return;

    event.preventDefault();
    if (this.isLastStep) {
      this.onSubmit();
    } else {
      this.goNext();
    }
  }

  onSubmit() {
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const formData = this.tripForm.value;
    const currentUser = this.authService.getCurrentUser();

    const tripData = {
      title: formData.title,
      description: formData.description,
      origin: formData.origin,
      destination: formData.destination,
      startDate: this.formatDate(formData.startDate),
      endDate: this.formatDate(formData.endDate),
      coverImage: formData.coverImage,
      isPublic: formData.isPublic,
      userId: currentUser?.userId
    };

    if (this.isEditMode && this.tripId) {
      this.updateTrip(this.tripId, tripData);
    } else {
      this.createTrip(tripData, formData);
    }
  }

  private updateTrip(id: string, data: any) {
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

  private createTrip(tripData: any, formData: any) {
    this.tripService.createTrip(tripData).subscribe({
      next: (response) => {
        if (formData.useAI) {
          this.submitting = false;
          this.generatingAI = true;
          this.generateWithAI(response.tripId, formData);
        } else {
          this.submitting = false;
          this.router.navigate(['/trip-details', response.tripId]);
        }
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Failed to create trip. Please try again.';
      }
    });
  }

  private generateWithAI(tripId: string, formData: any) {
    const durationDays = this.daysBetween(formData.startDate, formData.endDate);

    this.aiService.generateTrip({
      destination: formData.destination,
      duration_days: durationDays,
      budget: this.mapBudgetLabel(formData.budget),
      interests: [formData.tripType],
      travel_style: this.mapStyleLabel(formData.travelStyle),
      transport_preference: formData.transportPreference || 'mix'
    }).subscribe({
      next: (response) => {
        const tripData = response.trip || response;
        if (tripData?.itinerary?.length) {
          this.saveItineraryPlaces(tripId, tripData.itinerary, formData.destination);
        } else {
          this.generatingAI = false;
          this.router.navigate(['/trip-details', tripId]);
        }
      },
      error: () => {
        this.generatingAI = false;
        this.router.navigate(['/trip-details', tripId]);
      }
    });
  }

  private async saveItineraryPlaces(tripId: string, itinerary: any[], destination: string) {
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
            await this.tripService.addPlace(tripId, placeData).toPromise();
          } catch (err) {
            console.error(`Failed to save place ${placeData.placeName}:`, err);
          }

          currentTimeMinutes += duration + travelDuration;
        }
      }
    }

    this.generatingAI = false;
    this.router.navigate(['/trip-details', tripId]);
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

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private daysBetween(start: Date, end: Date): number {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e.getTime() - s.getTime());
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  private mapBudgetLabel(budget: string): string {
    const map: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High' };
    return map[budget] || 'Medium';
  }

  private mapStyleLabel(style: string): string {
    const map: Record<string, string> = { relaxed: 'Relaxed', balanced: 'Balanced', packed: 'Packed' };
    return map[style] || 'Balanced';
  }

  onCancel() {
    this.router.navigate(['/home']);
  }
}
