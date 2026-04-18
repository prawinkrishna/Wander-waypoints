import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Shared empty-state component. Used wherever a list, feed, or section
 * has no data, so users always see helpful guidance + a primary action
 * instead of a blank screen.
 *
 * Usage:
 *   <app-empty-state
 *     icon="travel_explore"
 *     title="No trips yet"
 *     subtitle="Start planning your next adventure."
 *     ctaLabel="Create your first trip"
 *     ctaIcon="add"
 *     ctaRoute="/create-trip">
 *   </app-empty-state>
 *
 * For non-route actions, omit ctaRoute and listen to (ctaClick).
 */
@Component({
    selector: 'app-empty-state',
    templateUrl: './empty-state.component.html',
    styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
    @Input() icon = 'inbox';
    @Input() title = 'Nothing here yet';
    @Input() subtitle?: string;
    @Input() ctaLabel?: string;
    @Input() ctaIcon?: string;
    @Input() ctaRoute?: string;
    @Input() ctaDisabled = false;
    @Output() ctaClick = new EventEmitter<void>();

    onCtaClick(): void {
        this.ctaClick.emit();
    }
}
