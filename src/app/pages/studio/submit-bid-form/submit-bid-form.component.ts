import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MarketplaceService, Bid } from '../../../core/service/marketplace.service';

@Component({
    selector: 'app-submit-bid-form',
    templateUrl: './submit-bid-form.component.html',
    styleUrls: ['./submit-bid-form.component.scss']
})
export class SubmitBidFormComponent implements OnInit {
    @Input() tripRequestId!: string;
    @Input() existingBid: Bid | null = null;
    @Output() submitted = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    bidForm!: FormGroup;
    isSubmitting = false;
    minDate = new Date();

    constructor(
        private fb: FormBuilder,
        private marketplaceService: MarketplaceService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.bidForm = this.fb.group({
            proposedPrice: [null, [Validators.required, Validators.min(1)]],
            description: ['', [Validators.required]],
            validUntil: [null]
        });

        if (this.existingBid) {
            this.bidForm.patchValue({
                proposedPrice: this.existingBid.proposedPrice,
                description: this.existingBid.description,
                validUntil: this.existingBid.validUntil ? new Date(this.existingBid.validUntil) : null
            });
        }
    }

    get isEditing(): boolean {
        return !!this.existingBid;
    }

    onSubmit(): void {
        if (this.bidForm.invalid || this.isSubmitting) return;

        this.isSubmitting = true;
        const formValue = this.bidForm.value;

        const data = {
            proposedPrice: formValue.proposedPrice,
            description: formValue.description,
            validUntil: formValue.validUntil
                ? new Date(formValue.validUntil).toISOString()
                : undefined
        };

        const request$ = this.existingBid
            ? this.marketplaceService.updateBid(this.existingBid.bidId, data)
            : this.marketplaceService.submitBid(this.tripRequestId, data);

        request$.subscribe({
            next: () => {
                this.isSubmitting = false;
                const message = this.existingBid ? 'Bid updated successfully!' : 'Bid submitted successfully!';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.submitted.emit();
            },
            error: (err) => {
                this.isSubmitting = false;
                const message = err?.error?.message || 'Failed to submit bid. Please try again.';
                this.snackBar.open(message, 'Close', { duration: 4000 });
            }
        });
    }

    onCancel(): void {
        this.cancelled.emit();
    }
}
