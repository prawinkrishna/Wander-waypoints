import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentService, ClientEditMode, ShareResponse } from '../../core/service/agent.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../environments/environment';

export interface ShareDialogData {
    tripId: string;
    tripTitle: string;
}

@Component({
    selector: 'app-share-itinerary-dialog',
    templateUrl: './share-itinerary-dialog.component.html',
    styleUrls: ['./share-itinerary-dialog.component.scss']
})
export class ShareItineraryDialogComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    isLoading = true;
    isSaving = false;
    isShared = false;
    shareToken: string | null = null;
    shareUrl: string = '';
    clientEditMode: ClientEditMode = 'none';
    shareTokenCreatedAt: Date | null = null;

    // Email notification fields
    sendEmailOnShare = false;
    clientEmail = '';
    clientName = '';

    // Expiration fields
    shareExpiresAt: Date | null = null;
    minDate = new Date();

    // Password protection
    requirePassword = false;
    sharePassword = '';
    hasPassword = false;

    editModeOptions: { value: ClientEditMode; label: string; description: string }[] = [
        { value: 'none', label: 'View only', description: 'Client can view but not make any changes' },
        { value: 'notes_only', label: 'Add notes/feedback', description: 'Client can add notes to activities' },
        { value: 'approve_reject', label: 'Approve/reject activities', description: 'Client can approve or reject each activity and add notes' },
        { value: 'full_edit', label: 'Full editing', description: 'Client can edit activities, times, accommodations, and transport' },
    ];

    constructor(
        private dialogRef: MatDialogRef<ShareItineraryDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ShareDialogData,
        private agentService: AgentService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.loadShareStatus();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadShareStatus() {
        this.isLoading = true;
        this.agentService.getShareStatus(this.data.tripId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                if (response) {
                    this.isShared = response.isShared;
                    this.shareToken = response.shareToken;
                    this.clientEditMode = response.clientEditMode;
                    this.shareTokenCreatedAt = response.shareTokenCreatedAt;
                    this.shareExpiresAt = response.shareExpiresAt ? new Date(response.shareExpiresAt) : null;
                    this.hasPassword = response.hasPassword || false;
                    this.requirePassword = this.hasPassword;
                    this.updateShareUrl();
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    updateShareUrl() {
        if (this.shareToken) {
            const baseUrl = window.location.origin;
            this.shareUrl = `${baseUrl}/shared/${this.shareToken}`;
        }
    }

    toggleSharing(enabled: boolean) {
        if (!enabled) {
            const ref = this.dialog.open(ConfirmDialogComponent, {
                data: {
                    title: 'Disable Sharing',
                    message: 'The shared link will stop working and your client will no longer be able to access the itinerary. Are you sure?',
                    type: 'danger',
                    confirmText: 'Disable Sharing',
                    cancelText: 'Cancel'
                }
            });
            ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
                if (confirmed) {
                    this.performToggleSharing(false);
                }
            });
        } else {
            this.performToggleSharing(true);
        }
    }

    private performToggleSharing(enabled: boolean) {
        this.isSaving = true;

        if (enabled) {
            const options: any = {};
            if (this.sendEmailOnShare && this.clientEmail) {
                options.clientEmail = this.clientEmail;
                options.clientName = this.clientName || undefined;
            }
            if (this.shareExpiresAt) {
                options.expiresAt = this.shareExpiresAt.toISOString();
            }
            if (this.requirePassword && this.sharePassword) {
                options.sharePassword = this.sharePassword;
            }

            this.agentService.enableSharing(this.data.tripId, this.clientEditMode, options).pipe(takeUntil(this.destroy$)).subscribe({
                next: (response) => {
                    this.isShared = true;
                    this.shareToken = response.shareToken;
                    this.shareTokenCreatedAt = response.shareTokenCreatedAt;
                    this.shareExpiresAt = response.shareExpiresAt ? new Date(response.shareExpiresAt) : null;
                    this.hasPassword = response.hasPassword || false;
                    this.updateShareUrl();
                    this.isSaving = false;
                    const msg = this.sendEmailOnShare && this.clientEmail
                        ? 'Sharing enabled and email sent to client'
                        : 'Sharing enabled';
                    this.snackBar.open(msg, 'Close', { duration: 2000 });
                },
                error: () => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to enable sharing', 'Close', { duration: 3000 });
                }
            });
        } else {
            this.agentService.disableSharing(this.data.tripId).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.isShared = false;
                    this.shareToken = null;
                    this.shareUrl = '';
                    this.shareTokenCreatedAt = null;
                    this.shareExpiresAt = null;
                    this.hasPassword = false;
                    this.requirePassword = false;
                    this.sharePassword = '';
                    this.isSaving = false;
                    this.snackBar.open('Sharing disabled', 'Close', { duration: 2000 });
                },
                error: () => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to disable sharing', 'Close', { duration: 3000 });
                }
            });
        }
    }

    updateEditMode(mode: ClientEditMode) {
        this.clientEditMode = mode;
        if (this.isShared) {
            this.isSaving = true;
            this.agentService.updateShareSettings(this.data.tripId, { clientEditMode: mode }).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.isSaving = false;
                    this.snackBar.open('Permissions updated', 'Close', { duration: 2000 });
                },
                error: () => {
                    this.isSaving = false;
                    this.snackBar.open('Failed to update permissions', 'Close', { duration: 3000 });
                }
            });
        }
    }

    updateExpiration() {
        if (!this.isShared) return;
        this.isSaving = true;
        this.agentService.updateShareSettings(this.data.tripId, {
            expiresAt: this.shareExpiresAt ? this.shareExpiresAt.toISOString() : undefined,
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                this.shareExpiresAt = response.shareExpiresAt ? new Date(response.shareExpiresAt) : null;
                this.isSaving = false;
                this.snackBar.open('Expiration updated', 'Close', { duration: 2000 });
            },
            error: () => {
                this.isSaving = false;
                this.snackBar.open('Failed to update expiration', 'Close', { duration: 3000 });
            }
        });
    }

    clearExpiration() {
        this.shareExpiresAt = null;
        if (this.isShared) {
            this.updateExpiration();
        }
    }

    togglePasswordProtection() {
        if (!this.isShared) return;
        if (!this.requirePassword && this.hasPassword) {
            // Removing password
            this.isSaving = true;
            this.agentService.updateShareSettings(this.data.tripId, { removePassword: true }).pipe(takeUntil(this.destroy$)).subscribe({
                next: () => {
                    this.hasPassword = false;
                    this.sharePassword = '';
                    this.isSaving = false;
                    this.snackBar.open('Password protection removed', 'Close', { duration: 2000 });
                },
                error: () => {
                    this.requirePassword = true;
                    this.isSaving = false;
                    this.snackBar.open('Failed to remove password', 'Close', { duration: 3000 });
                }
            });
        }
    }

    setPassword() {
        if (!this.isShared || !this.sharePassword) return;
        this.isSaving = true;
        this.agentService.updateShareSettings(this.data.tripId, { sharePassword: this.sharePassword }).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.hasPassword = true;
                this.sharePassword = '';
                this.isSaving = false;
                this.snackBar.open('Password set', 'Close', { duration: 2000 });
            },
            error: () => {
                this.isSaving = false;
                this.snackBar.open('Failed to set password', 'Close', { duration: 3000 });
            }
        });
    }

    regenerateLink() {
        const ref = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Regenerate Link',
                message: 'This will create a new link and the previous link will stop working. Any client using the old link will lose access. Continue?',
                type: 'warning',
                confirmText: 'Regenerate',
                cancelText: 'Cancel'
            }
        });
        ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
            if (confirmed) {
                this.performRegenerateLink();
            }
        });
    }

    private performRegenerateLink() {
        this.isSaving = true;
        this.agentService.regenerateShareToken(this.data.tripId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                this.shareToken = response.shareToken;
                this.updateShareUrl();
                this.shareTokenCreatedAt = new Date();
                this.isSaving = false;
                this.snackBar.open('New link generated. Previous link no longer works.', 'Close', { duration: 3000 });
            },
            error: () => {
                this.isSaving = false;
                this.snackBar.open('Failed to regenerate link', 'Close', { duration: 3000 });
            }
        });
    }

    copyLink() {
        navigator.clipboard.writeText(this.shareUrl).then(() => {
            this.snackBar.open('Link copied to clipboard', 'Close', { duration: 2000 });
        }).catch(() => {
            this.snackBar.open('Failed to copy link', 'Close', { duration: 3000 });
        });
    }

    close() {
        this.dialogRef.close({
            isShared: this.isShared,
            clientEditMode: this.clientEditMode
        });
    }
}
