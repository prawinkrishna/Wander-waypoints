import { Component, OnInit } from '@angular/core';
import { PlannerStateService } from '../../../../core/service/planner-state.service';
import { TripPlace } from '../../../../../../projects/wander-library/src/lib/models/trip-place.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-trip-canvas',
    templateUrl: './trip-canvas.component.html',
    styleUrls: ['./trip-canvas.component.scss']
})
export class TripCanvasComponent implements OnInit {
    currentTripPlaces$: Observable<TripPlace[]>;
    activeTab: 'itinerary' | 'map' = 'itinerary';

    constructor(private plannerState: PlannerStateService) {
        this.currentTripPlaces$ = this.plannerState.currentTripPlaces$;
    }

    ngOnInit(): void {
    }

    setActiveTab(tab: 'itinerary' | 'map') {
        this.activeTab = tab;
        // Notify service if needed (for map resize trigger)
    }
}
