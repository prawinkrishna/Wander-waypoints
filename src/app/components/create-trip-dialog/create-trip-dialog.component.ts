import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TripService } from '../../core/service/trip.service';
import { AuthService } from '../../core/service/auth.service';

@Component({
    selector: 'app-create-trip-dialog',
    templateUrl: './create-trip-dialog.component.html',
    styleUrls: ['./create-trip-dialog.component.scss']
})
export class CreateTripDialogComponent {
    tripForm: FormGroup;
    isLoading = false;
    error: string | null = null;

    constructor(
        private fb: FormBuilder,
        private tripService: TripService,
        private authService: AuthService,
        public dialogRef: MatDialogRef<CreateTripDialogComponent>
    ) {
        this.tripForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required],
            visibility: ['public', Validators.required]
        });
    }

    onSubmit() {
        if (this.tripForm.valid) {
            this.isLoading = true;
            this.error = null;

            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                this.error = 'You must be logged in to create a trip.';
                this.isLoading = false;
                return;
            }

            const tripData = {
                ...this.tripForm.value,
                userId: currentUser.userId
            };

            this.tripService.createTrip(tripData).subscribe({
                next: (newTrip) => {
                    this.isLoading = false;
                    this.dialogRef.close(newTrip);
                },
                error: (err) => {
                    console.error('Error creating trip:', err);
                    this.error = 'Failed to create trip. Please try again.';
                    this.isLoading = false;
                }
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
