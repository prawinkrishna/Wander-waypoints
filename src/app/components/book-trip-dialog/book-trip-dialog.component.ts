import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService, CreateBookingRequest } from '../../core/service/booking.service';

export interface BookTripDialogData {
    trip: {
        tripId: string;
        title: string;
        pricePerPerson: number;
        currency: string;
        availableDates?: string[];
        minGroupSize?: number;
        maxGroupSize?: number;
        totalSlots?: number;
        bookedSlots?: number;
    };
}

@Component({
    selector: 'app-book-trip-dialog',
    templateUrl: './book-trip-dialog.component.html',
    styleUrls: ['./book-trip-dialog.component.scss']
})
export class BookTripDialogComponent implements OnInit {
    bookingForm: FormGroup;
    isSubmitting = false;
    totalAmount = 0;
    availableSlots = 0;
    Math = Math; // Make Math available in template

    constructor(
        public dialogRef: MatDialogRef<BookTripDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: BookTripDialogData,
        private fb: FormBuilder,
        private bookingService: BookingService,
        private snackBar: MatSnackBar
    ) {
        this.availableSlots = (data.trip.totalSlots || 100) - (data.trip.bookedSlots || 0);

        this.bookingForm = this.fb.group({
            travelDate: ['', Validators.required],
            numberOfTravelers: [1, [Validators.required, Validators.min(data.trip.minGroupSize || 1), Validators.max(Math.min(data.trip.maxGroupSize || 20, this.availableSlots))]],
            contactName: ['', Validators.required],
            contactEmail: ['', [Validators.required, Validators.email]],
            contactPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
            specialRequests: [''],
            travelerDetails: this.fb.array([])
        });
    }

    ngOnInit() {
        this.calculateTotal();

        // Listen to traveler count changes
        this.bookingForm.get('numberOfTravelers')?.valueChanges.subscribe(count => {
            this.updateTravelerDetails(count);
            this.calculateTotal();
        });

        // Initialize with 1 traveler
        this.updateTravelerDetails(1);
    }

    get travelerDetails(): FormArray {
        return this.bookingForm.get('travelerDetails') as FormArray;
    }

    updateTravelerDetails(count: number) {
        const currentLength = this.travelerDetails.length;

        if (count > currentLength) {
            for (let i = currentLength; i < count; i++) {
                this.travelerDetails.push(this.fb.group({
                    name: ['', Validators.required],
                    age: [null],
                    gender: ['']
                }));
            }
        } else if (count < currentLength) {
            for (let i = currentLength; i > count; i--) {
                this.travelerDetails.removeAt(i - 1);
            }
        }
    }

    calculateTotal() {
        const travelers = this.bookingForm.get('numberOfTravelers')?.value || 1;
        this.totalAmount = travelers * (this.data.trip.pricePerPerson || 0);
    }

    onSubmit() {
        if (this.bookingForm.invalid) {
            this.bookingForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const formValue = this.bookingForm.value;
        const bookingData: CreateBookingRequest = {
            tripId: this.data.trip.tripId,
            travelDate: new Date(formValue.travelDate).toISOString(),
            numberOfTravelers: formValue.numberOfTravelers,
            travelerDetails: formValue.travelerDetails,
            contactName: formValue.contactName,
            contactEmail: formValue.contactEmail,
            contactPhone: formValue.contactPhone,
            specialRequests: formValue.specialRequests
        };

        this.bookingService.createBooking(bookingData).subscribe({
            next: (booking) => {
                this.isSubmitting = false;
                this.dialogRef.close({ success: true, booking });
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error('Booking error:', err);
                this.snackBar.open(err.error?.message || 'Failed to create booking. Please try again.', 'Close', { duration: 5000 });
            }
        });
    }

    onCancel() {
        this.dialogRef.close();
    }
}
