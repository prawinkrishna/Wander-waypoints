import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Bid } from '../../../core/service/marketplace.service';

@Component({
    selector: 'app-bid-card',
    templateUrl: './bid-card.component.html',
    styleUrls: ['./bid-card.component.scss']
})
export class BidCardComponent {
    @Input() bid!: Bid;
    @Input() isOwner = false;
    @Input() showActions = true;
    @Output() accept = new EventEmitter<string>();
    @Output() reject = new EventEmitter<string>();
    @Output() viewDetails = new EventEmitter<string>();

    get canShowActions(): boolean {
        return this.isOwner && this.showActions && this.bid?.status === 'pending';
    }

    get truncatedDescription(): string {
        if (!this.bid?.description) return '';
        return this.bid.description.length > 150
            ? this.bid.description.substring(0, 150) + '...'
            : this.bid.description;
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            pending: 'status-pending',
            accepted: 'status-accepted',
            rejected: 'status-rejected',
            withdrawn: 'status-withdrawn'
        };
        return classes[status] || '';
    }

    formatPrice(price: number, currency: string = 'INR'): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(price);
    }

    onAccept(event: Event): void {
        event.stopPropagation();
        this.accept.emit(this.bid.bidId);
    }

    onReject(event: Event): void {
        event.stopPropagation();
        this.reject.emit(this.bid.bidId);
    }

    onViewDetails(): void {
        this.viewDetails.emit(this.bid.bidId);
    }
}
