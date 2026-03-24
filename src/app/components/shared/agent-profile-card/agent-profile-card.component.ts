import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { AgentProfile } from '../../../core/service/marketplace.service';

@Component({
    selector: 'app-agent-profile-card',
    templateUrl: './agent-profile-card.component.html',
    styleUrls: ['./agent-profile-card.component.scss']
})
export class AgentProfileCardComponent implements OnChanges {
    @Input() agent!: AgentProfile;
    @Output() viewProfile = new EventEmitter<string>();

    cachedRatingStars: number[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['agent']) {
            const rating = Math.round(this.agent?.averageRating || 0);
            this.cachedRatingStars = Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
        }
    }

    get ratingStars(): number[] {
        return this.cachedRatingStars;
    }

    get formattedResponseTime(): string {
        if (!this.agent?.responseTimeHours) return 'N/A';
        const hours = this.agent.responseTimeHours;
        if (hours < 1) return 'Under 1 hour';
        if (hours === 1) return '1 hour';
        if (hours < 24) return `${hours} hours`;
        const days = Math.round(hours / 24);
        return days === 1 ? '1 day' : `${days} days`;
    }

    onClick(): void {
        this.viewProfile.emit(this.agent.agencyId);
    }
}
