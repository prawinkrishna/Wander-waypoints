import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TripRequest } from '../../../core/service/marketplace.service';

@Component({
    selector: 'app-trip-request-card',
    templateUrl: './trip-request-card.component.html',
    styleUrls: ['./trip-request-card.component.scss']
})
export class TripRequestCardComponent {
    @Input() request!: TripRequest;
    @Output() viewDetails = new EventEmitter<string>();

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
            open: 'status-open',
            in_progress: 'status-progress',
            completed: 'status-completed',
            cancelled: 'status-cancelled'
        };
        return classes[status] || '';
    }

    formatBudget(min?: number, max?: number): string {
        const fmt = (n: number) =>
            new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(n);

        if (min && max) return `${fmt(min)} - ${fmt(max)}`;
        if (max) return `Up to ${fmt(max)}`;
        if (min) return `From ${fmt(min)}`;
        return 'Flexible';
    }

    onClick() {
        this.viewDetails.emit(this.request.tripRequestId);
    }
}
