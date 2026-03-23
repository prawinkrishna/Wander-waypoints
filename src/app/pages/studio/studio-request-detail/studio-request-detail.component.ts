import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    MarketplaceService,
    TripRequest,
    Bid
} from '../../../core/service/marketplace.service';
import {
    ConfirmDialogComponent,
    ConfirmDialogData,
} from '../../../components/shared/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-studio-request-detail',
    templateUrl: './studio-request-detail.component.html',
    styleUrls: ['./studio-request-detail.component.scss']
})
export class StudioRequestDetailComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    request: TripRequest | null = null;
    isLoading = true;
    loadError = false;
    myBid: Bid | null = null;
    showBidForm = false;
    currentUserId = '';

    private requestId = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private marketplaceService: MarketplaceService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                this.currentUserId = user.userId || user.id || '';
            } catch {
                this.currentUserId = '';
            }
        }

        this.requestId = this.route.snapshot.paramMap.get('id') || '';
        if (this.requestId) {
            this.loadData();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadData(): void {
        this.isLoading = true;
        this.loadError = false;
        this.marketplaceService.getRequest(this.requestId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (request) => {
                this.request = request;
                this.checkExistingBid();
            },
            error: () => {
                this.isLoading = false;
                this.loadError = true;
                this.snackBar.open('Failed to load trip request', 'Close', { duration: 3000 });
            }
        });
    }

    private checkExistingBid(): void {
        this.marketplaceService.listBids(this.requestId).pipe(takeUntil(this.destroy$)).subscribe({
            next: (bids) => {
                this.myBid = bids.find(b => b.user?.userId === this.currentUserId) || null;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/studio/marketplace']);
    }

    onToggleBidForm(): void {
        this.showBidForm = !this.showBidForm;
    }

    onBidSubmitted(): void {
        this.showBidForm = false;
        this.loadData();
        this.snackBar.open('Bid submitted successfully!', 'Close', { duration: 3000 });
    }

    onBidCancelled(): void {
        this.showBidForm = false;
    }

    onWithdrawBid(): void {
        if (!this.myBid) return;

        const dialogData: ConfirmDialogData = {
            title: 'Withdraw Bid',
            message: 'Are you sure you want to withdraw your bid? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Withdraw Bid',
            cancelText: 'Cancel',
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '420px',
            data: dialogData,
        });

        dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
            if (confirmed) {
                this.marketplaceService.withdrawBid(this.myBid!.bidId).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.myBid = null;
                        this.snackBar.open('Bid withdrawn successfully', 'Close', { duration: 3000 });
                        this.loadData();
                    },
                    error: () => {
                        this.snackBar.open('Failed to withdraw bid', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }

    formatBudget(min?: number, max?: number): string {
        const fmt = (n: number) =>
            new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: this.request?.currency || 'INR',
                maximumFractionDigits: 0
            }).format(n);

        if (min && max) return `${fmt(min)} - ${fmt(max)}`;
        if (max) return `Up to ${fmt(max)}`;
        if (min) return `From ${fmt(min)}`;
        return 'Flexible';
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: this.myBid?.currency || 'INR',
            maximumFractionDigits: 0
        }).format(price);
    }

    getTripTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            solo: 'Solo',
            couple: 'Couple',
            group: 'Group',
            family: 'Family'
        };
        return labels[type] || type;
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            pending: 'status-pending',
            accepted: 'status-accepted',
            rejected: 'status-rejected',
            withdrawn: 'status-withdrawn',
            open: 'status-open',
            in_progress: 'status-progress',
            completed: 'status-completed',
            cancelled: 'status-cancelled'
        };
        return classes[status] || '';
    }

    getDaysUntilTrip(): number | null {
        if (!this.request?.startDate) return null;
        const start = new Date(this.request.startDate);
        const now = new Date();
        const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : null;
    }

    getTripDuration(): number {
        if (!this.request?.startDate || !this.request?.endDate) return 0;
        const start = new Date(this.request.startDate);
        const end = new Date(this.request.endDate);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
}
