import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    MarketplaceService,
    CreateTripRequestData,
    TripType,
} from '../../../core/service/marketplace.service';

@Component({
    selector: 'app-create-request',
    templateUrl: './create-request.component.html',
    styleUrls: ['./create-request.component.scss'],
})
export class CreateRequestComponent {
    isSubmitting = false;

    tripTypes: { value: TripType; label: string }[] = [
        { value: 'solo', label: 'Solo' },
        { value: 'couple', label: 'Couple' },
        { value: 'group', label: 'Group' },
        { value: 'family', label: 'Family' },
    ];

    requestForm = new FormGroup({
        title: new FormControl('', [Validators.required]),
        description: new FormControl('', [Validators.required]),
        destination: new FormControl('', [Validators.required]),
        startDate: new FormControl<Date | null>(null, [Validators.required]),
        endDate: new FormControl<Date | null>(null, [Validators.required]),
        budgetMin: new FormControl<number | null>(null, [Validators.min(0)]),
        budgetMax: new FormControl<number | null>(null, [Validators.min(0)]),
        numberOfTravelers: new FormControl(1, [Validators.required, Validators.min(1)]),
        tripType: new FormControl<TripType>('solo'),
    });

    minDate = new Date();

    constructor(
        private marketplaceService: MarketplaceService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {}

    get startDateValue(): Date | null {
        return this.requestForm.get('startDate')?.value ?? null;
    }

    onSubmit(): void {
        if (this.requestForm.invalid || this.isSubmitting) {
            this.requestForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const formValue = this.requestForm.value;

        const data: CreateTripRequestData = {
            title: formValue.title!,
            description: formValue.description!,
            destination: formValue.destination!,
            startDate: formValue.startDate!.toISOString().split('T')[0],
            endDate: formValue.endDate!.toISOString().split('T')[0],
            numberOfTravelers: formValue.numberOfTravelers ?? 1,
            tripType: formValue.tripType ?? 'solo',
        };

        if (formValue.budgetMin != null) {
            data.budgetMin = formValue.budgetMin;
        }
        if (formValue.budgetMax != null) {
            data.budgetMax = formValue.budgetMax;
        }

        this.marketplaceService.createRequest(data).subscribe({
            next: () => {
                this.snackBar.open('Trip request posted!', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                });
                this.router.navigate(['/marketplace/my-requests']);
            },
            error: (err) => {
                this.isSubmitting = false;
                const message = err?.error?.message || 'Failed to create request. Please try again.';
                this.snackBar.open(message, 'Close', {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                });
            },
        });
    }

    onCancel(): void {
        this.router.navigate(['/marketplace']);
    }
}
