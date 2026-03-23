import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    MarketplaceService,
    TripRequest,
    Bid,
} from '../../../core/service/marketplace.service';
import {
    ConfirmDialogComponent,
    ConfirmDialogData,
} from '../../../components/shared/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-request-detail',
    templateUrl: './request-detail.component.html',
    styleUrls: ['./request-detail.component.scss'],
})
export class RequestDetailComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    request: TripRequest | null = null;
    bids: Bid[] = [];
    selectedBid: Bid | null = null;
    isLoading = true;
    loadError = false;
    isOwner = false;
    currentUserId: string = '';

    private requestId: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private marketplaceService: MarketplaceService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.currentUserId = localStorage.getItem('userId') || '';

        this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            this.requestId = params['id'];
            if (this.requestId) {
                this.loadRequestDetail();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadRequestDetail(): void {
        this.isLoading = true;
        this.loadError = false;

        this.marketplaceService.getRequest(this.requestId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (request) => {
                this.request = request;
                this.isOwner = request.user?.userId === this.currentUserId;
                this.loadBids();
            },
            error: () => {
                this.isLoading = false;
                this.loadError = true;
                this.snackBar.open('Failed to load trip request.', 'Close', {
                    duration: 4000,
                });
            },
        });
    }

    loadBids(): void {
        this.marketplaceService.listBids(this.requestId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (bids) => {
                this.bids = bids;
                this.isLoading = false;

                // If a bid was selected, refresh it
                if (this.selectedBid) {
                    const updated = bids.find(
                        (b) => b.bidId === this.selectedBid!.bidId
                    );
                    this.selectedBid = updated || null;
                }
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    onAcceptBid(bidId: string): void {
        const dialogData: ConfirmDialogData = {
            title: 'Accept Bid',
            message: 'Are you sure you want to accept this bid? Other pending bids will be automatically rejected.',
            type: 'info',
            confirmText: 'Accept Bid',
            cancelText: 'Cancel',
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '420px',
            data: dialogData,
        });

        dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
            if (confirmed) {
                this.marketplaceService.acceptBid(bidId).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.snackBar.open('Bid accepted successfully!', 'Close', {
                            duration: 3000,
                        });
                        this.loadRequestDetail();
                    },
                    error: () => {
                        this.snackBar.open('Failed to accept bid.', 'Close', {
                            duration: 4000,
                        });
                    },
                });
            }
        });
    }

    onRejectBid(bidId: string): void {
        const dialogData: ConfirmDialogData = {
            title: 'Reject Bid',
            message: 'Are you sure you want to reject this bid? This action cannot be undone.',
            type: 'warning',
            confirmText: 'Reject Bid',
            cancelText: 'Cancel',
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '420px',
            data: dialogData,
        });

        dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
            if (confirmed) {
                this.marketplaceService.rejectBid(bidId).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.snackBar.open('Bid rejected.', 'Close', {
                            duration: 3000,
                        });
                        this.loadRequestDetail();
                    },
                    error: () => {
                        this.snackBar.open('Failed to reject bid.', 'Close', {
                            duration: 4000,
                        });
                    },
                });
            }
        });
    }

    onViewBid(bidId: string): void {
        const bid = this.bids.find((b) => b.bidId === bidId);
        this.selectedBid = bid || null;
    }

    closeBidChat(): void {
        this.selectedBid = null;
    }

    goBack(): void {
        this.router.navigate(['/marketplace/my-requests']);
    }

    getTripTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            solo: 'Solo',
            couple: 'Couple',
            group: 'Group',
            family: 'Family',
        };
        return labels[type] || type;
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            open: 'Open',
            in_progress: 'In Progress',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return labels[status] || status;
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            open: 'status-open',
            in_progress: 'status-progress',
            completed: 'status-completed',
            cancelled: 'status-cancelled',
        };
        return classes[status] || '';
    }

    formatBudget(min?: number, max?: number): string {
        const fmt = (n: number) =>
            new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
            }).format(n);

        if (min && max) return `${fmt(min)} - ${fmt(max)}`;
        if (max) return `Up to ${fmt(max)}`;
        if (min) return `From ${fmt(min)}`;
        return 'Flexible';
    }

    getDayCount(): number {
        if (!this.request?.startDate || !this.request?.endDate) return 0;
        const start = new Date(this.request.startDate);
        const end = new Date(this.request.endDate);
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    getPendingBids(): Bid[] {
        return this.bids.filter((b) => b.status === 'pending');
    }

    getAcceptedBid(): Bid | undefined {
        return this.bids.find((b) => b.status === 'accepted');
    }

    trackByBidId(_index: number, bid: Bid): string {
        return bid.bidId;
    }
}
