import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgentService, AgencyProfile } from '../../../core/service/agent.service';

@Component({
    selector: 'app-studio-settings',
    templateUrl: './studio-settings.component.html',
    styleUrls: ['./studio-settings.component.scss']
})
export class StudioSettingsComponent implements OnInit {
    settingsForm!: FormGroup;
    isLoading = true;
    isSaving = false;
    logoPreview: string | null = null;
    selectedLogoFile: File | null = null;

    constructor(
        private fb: FormBuilder,
        private agentService: AgentService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.initForm();
        this.loadProfile();
    }

    initForm() {
        this.settingsForm = this.fb.group({
            // Basic Info
            name: ['', Validators.required],
            tagline: [''],
            description: [''],

            // Contact
            contactEmail: ['', [Validators.required, Validators.email]],
            contactPhone: [''],
            websiteUrl: [''],

            // Address
            address: [''],
            gstNumber: [''],

            // Bank Details
            accountName: [''],
            accountNumber: [''],
            bankName: [''],
            ifscCode: [''],
            upiId: [''],

            // Default Terms
            termsAndConditions: [''],
            cancellationPolicy: [''],
            paymentTerms: ['']
        });
    }

    loadProfile() {
        this.isLoading = true;
        this.agentService.getAgencyProfile().subscribe({
            next: (profile) => {
                this.populateForm(profile);
                this.logoPreview = profile.logoUrl || null;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading profile:', error);
                this.isLoading = false;
                // If no profile exists, that's okay - user can create one
            }
        });
    }

    populateForm(profile: AgencyProfile) {
        this.settingsForm.patchValue({
            name: profile.name,
            tagline: profile.tagline,
            description: profile.description,
            contactEmail: profile.contactEmail,
            contactPhone: profile.contactPhone,
            websiteUrl: profile.websiteUrl,
            address: profile.address,
            gstNumber: profile.gstNumber,
            accountName: profile.bankDetails?.accountName,
            accountNumber: profile.bankDetails?.accountNumber,
            bankName: profile.bankDetails?.bankName,
            ifscCode: profile.bankDetails?.ifscCode,
            upiId: profile.bankDetails?.upiId,
            termsAndConditions: profile.termsAndConditions,
            cancellationPolicy: profile.cancellationPolicy,
            paymentTerms: profile.paymentTerms
        });
    }

    onLogoSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                this.snackBar.open('Image must be smaller than 2MB', 'Close', { duration: 3000 });
                return;
            }

            this.selectedLogoFile = file;

            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.logoPreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    removeLogo() {
        this.logoPreview = null;
        this.selectedLogoFile = null;
    }

    saveSettings() {
        if (this.settingsForm.invalid) {
            this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.isSaving = true;
        const formValue = this.settingsForm.value;

        const profileData: Partial<AgencyProfile> = {
            name: formValue.name,
            tagline: formValue.tagline,
            description: formValue.description,
            contactEmail: formValue.contactEmail,
            contactPhone: formValue.contactPhone,
            websiteUrl: formValue.websiteUrl,
            address: formValue.address,
            gstNumber: formValue.gstNumber,
            termsAndConditions: formValue.termsAndConditions,
            cancellationPolicy: formValue.cancellationPolicy,
            paymentTerms: formValue.paymentTerms,
            bankDetails: {
                accountName: formValue.accountName,
                accountNumber: formValue.accountNumber,
                bankName: formValue.bankName,
                ifscCode: formValue.ifscCode,
                upiId: formValue.upiId
            }
        };

        // If there's a new logo, upload it first
        if (this.selectedLogoFile) {
            this.agentService.uploadLogo(this.selectedLogoFile).subscribe({
                next: (response) => {
                    profileData.logoUrl = response.logoUrl;
                    this.saveProfile(profileData);
                },
                error: (error) => {
                    // Logo upload failed — surface this to the user via a
                    // snack bar (silent fall-through to "save without logo"
                    // looked like a no-op to the user) and still attempt
                    // to save the rest of the profile so their other edits
                    // aren't lost.
                    const msg =
                        error?.error?.message ||
                        'Logo upload failed — your other settings will still be saved.';
                    this.snackBar.open(msg, 'Close', { duration: 5000 });
                    this.saveProfile(profileData);
                }
            });
        } else {
            this.saveProfile(profileData);
        }
    }

    private saveProfile(profileData: Partial<AgencyProfile>) {
        this.agentService.updateAgencyProfile(profileData).subscribe({
            next: () => {
                this.isSaving = false;
                this.selectedLogoFile = null;
                this.snackBar.open('Settings saved successfully!', 'Close', { duration: 3000 });
            },
            error: (error) => {
                this.isSaving = false;
                const msg = error?.error?.message || 'Failed to save settings. Please try again.';
                this.snackBar.open(msg, 'Close', { duration: 5000 });
            }
        });
    }

    // Default content templates
    setDefaultTerms() {
        this.settingsForm.patchValue({
            termsAndConditions: `1. Booking is confirmed only upon receipt of the advance payment.
2. The itinerary is subject to change based on weather conditions, local regulations, or unforeseen circumstances.
3. Any additional expenses arising from circumstances beyond our control (natural disasters, political disturbances, etc.) are the responsibility of the traveler.
4. All travelers must carry valid ID proof (Aadhaar/Passport) during the trip.
5. We reserve the right to modify the itinerary to ensure traveler safety and comfort.`
        });
    }

    setDefaultCancellation() {
        this.settingsForm.patchValue({
            cancellationPolicy: `Cancellation charges apply as follows:
- 30+ days before departure: 10% of total cost
- 15-29 days before departure: 25% of total cost
- 7-14 days before departure: 50% of total cost
- Less than 7 days before departure: 100% of total cost
- No-show: 100% of total cost

Refunds will be processed within 7-10 business days.`
        });
    }

    setDefaultPayment() {
        this.settingsForm.patchValue({
            paymentTerms: `Payment Schedule:
- 30% advance at the time of booking
- 70% balance 15 days before departure

Payment Methods:
- Bank Transfer (NEFT/IMPS/RTGS)
- UPI
- Credit/Debit Card (additional charges may apply)

All payments should be made in favor of the agency name mentioned above.`
        });
    }
}
