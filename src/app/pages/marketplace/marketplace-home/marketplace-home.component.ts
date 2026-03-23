import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    MarketplaceService,
    TripRequest,
    TripType,
    TripRequestFilters,
} from '../../../core/service/marketplace.service';

@Component({
    selector: 'app-marketplace-home',
    templateUrl: './marketplace-home.component.html',
    styleUrls: ['./marketplace-home.component.scss'],
})
export class MarketplaceHomeComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    requests: TripRequest[] = [];
    isLoading = true;
    totalRequests = 0;

    // Filters
    destinationFilter = '';
    tripTypeFilter: TripType | '' = '';
    page = 1;
    limit = 12;

    tripTypes: { value: TripType | ''; label: string }[] = [
        { value: '', label: 'All Types' },
        { value: 'solo', label: 'Solo' },
        { value: 'couple', label: 'Couple' },
        { value: 'group', label: 'Group' },
        { value: 'family', label: 'Family' },
    ];

    constructor(
        private marketplaceService: MarketplaceService,
        private router: Router
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

        const filters: TripRequestFilters = {
            page: this.page,
            limit: this.limit,
        };

        if (this.destinationFilter.trim()) {
            filters.destination = this.destinationFilter.trim();
        }
        if (this.tripTypeFilter) {
            filters.tripType = this.tripTypeFilter;
        }

        this.marketplaceService.listRequests(filters).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                this.requests = response.data;
                this.totalRequests = response.total;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            },
        });
    }

    onSearch(): void {
        this.page = 1;
        this.loadRequests();
    }

    clearFilters(): void {
        this.destinationFilter = '';
        this.tripTypeFilter = '';
        this.page = 1;
        this.loadRequests();
    }

    onViewRequest(id: string): void {
        this.router.navigate(['/marketplace/request', id]);
    }

    onPageChange(event: { pageIndex: number; pageSize: number }): void {
        this.page = event.pageIndex + 1;
        this.limit = event.pageSize;
        this.loadRequests();
    }

    trackByRequestId(_index: number, request: TripRequest): string {
        return request.tripRequestId;
    }
}
