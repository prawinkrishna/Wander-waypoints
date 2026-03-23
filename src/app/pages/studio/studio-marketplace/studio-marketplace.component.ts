import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    MarketplaceService,
    TripRequest,
    TripRequestFilters,
    TripType
} from '../../../core/service/marketplace.service';

@Component({
    selector: 'app-studio-marketplace',
    templateUrl: './studio-marketplace.component.html',
    styleUrls: ['./studio-marketplace.component.scss']
})
export class StudioMarketplaceComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    requests: TripRequest[] = [];
    isLoading = true;
    totalRequests = 0;

    destinationFilter = '';
    tripTypeFilter: TripType | '' = '';
    page = 1;
    readonly pageSize = 12;

    tripTypes: { value: TripType | ''; label: string }[] = [
        { value: '', label: 'All Types' },
        { value: 'solo', label: 'Solo' },
        { value: 'couple', label: 'Couple' },
        { value: 'family', label: 'Family' },
        { value: 'group', label: 'Group' }
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
            limit: this.pageSize
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
            }
        });
    }

    onApplyFilters(): void {
        this.page = 1;
        this.loadRequests();
    }

    onClearFilters(): void {
        this.destinationFilter = '';
        this.tripTypeFilter = '';
        this.page = 1;
        this.loadRequests();
    }

    onPageChange(newPage: number): void {
        this.page = newPage;
        this.loadRequests();
    }

    onViewRequest(id: string): void {
        this.router.navigate(['/studio/marketplace/request', id]);
    }

    get totalPages(): number {
        return Math.ceil(this.totalRequests / this.pageSize);
    }

    get hasFilters(): boolean {
        return !!this.destinationFilter.trim() || !!this.tripTypeFilter;
    }
}
