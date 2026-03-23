import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    MarketplaceService,
    TripRequest,
} from '../../../core/service/marketplace.service';
import {
    ConfirmDialogComponent,
    ConfirmDialogData,
} from '../../../components/shared/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-my-requests',
    templateUrl: './my-requests.component.html',
    styleUrls: ['./my-requests.component.scss'],
})
export class MyRequestsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    requests: TripRequest[] = [];
    activeRequests: TripRequest[] = [];
    closedRequests: TripRequest[] = [];
    isLoading = true;

    constructor(
        private marketplaceService: MarketplaceService,
        private router: Router,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.loadRequests();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadRequests(): void {
        this.isLoading = true;
        this.marketplaceService.getMyRequests().pipe(takeUntil(this.destroy$)).subscribe({
            next: (requests) => {
                this.requests = requests;
                this.activeRequests = requests.filter(
                    (r) => r.status === 'open' || r.status === 'in_progress'
                );
                this.closedRequests = requests.filter(
                    (r) => r.status === 'completed' || r.status === 'cancelled'
                );
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    onViewRequest(id: string): void {
        this.router.navigate(['/marketplace/request', id]);
    }

    onCancelRequest(id: string): void {
        const dialogData: ConfirmDialogData = {
            title: 'Cancel Trip Request',
            message: 'Are you sure you want to cancel this trip request? This action cannot be undone and all pending bids will be dismissed.',
            type: 'danger',
            confirmText: 'Cancel Request',
            cancelText: 'Keep Request',
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '420px',
            data: dialogData,
        });

        dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed) => {
            if (confirmed) {
                this.marketplaceService.cancelRequest(id).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.snackBar.open('Trip request cancelled.', 'Close', {
                            duration: 3000,
                        });
                        this.loadRequests();
                    },
                    error: () => {
                        this.snackBar.open('Failed to cancel request. Please try again.', 'Close', {
                            duration: 4000,
                        });
                    },
                });
            }
        });
    }

    getActiveRequests(): TripRequest[] {
        return this.activeRequests;
    }

    getClosedRequests(): TripRequest[] {
        return this.closedRequests;
    }

    trackByRequestId(_index: number, request: TripRequest): string {
        return request.tripRequestId;
    }
}
