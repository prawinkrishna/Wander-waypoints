import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    MarketplaceService,
    Bid
} from '../../../core/service/marketplace.service';

@Component({
    selector: 'app-my-bids',
    templateUrl: './my-bids.component.html',
    styleUrls: ['./my-bids.component.scss']
})
export class MyBidsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    bids: Bid[] = [];
    isLoading = true;
    selectedTab = 0;

    constructor(
        private marketplaceService: MarketplaceService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadBids();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadBids(): void {
        this.isLoading = true;
        this.marketplaceService.getMyBids().pipe(takeUntil(this.destroy$)).subscribe({
            next: (bids) => {
                this.bids = bids;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    get pendingBids(): Bid[] {
        return this.bids.filter(b => b.status === 'pending');
    }

    get acceptedBids(): Bid[] {
        return this.bids.filter(b => b.status === 'accepted');
    }

    get rejectedBids(): Bid[] {
        return this.bids.filter(b => b.status === 'rejected' || b.status === 'withdrawn');
    }

    onViewBid(bidId: string): void {
        const bid = this.bids.find(b => b.bidId === bidId);
        if (bid?.tripRequest?.tripRequestId) {
            this.router.navigate(['/studio/marketplace/request', bid.tripRequest.tripRequestId]);
        }
    }

    getTabLabel(tab: string, count: number): string {
        return `${tab} (${count})`;
    }
}
