import { Component, OnInit } from '@angular/core';
import { AgencyService } from '../../../core/service/agency.service';

@Component({
    selector: 'app-trip-management',
    templateUrl: './trip-management.component.html',
    styleUrls: ['./trip-management.component.scss']
})
export class TripManagementComponent implements OnInit {

    trips: any[] = [];

    constructor(private agencyService: AgencyService) { }

    ngOnInit() {
        this.agencyService.getAgencyTrips().subscribe(trips => {
            this.trips = trips.map(t => ({
                id: t.tripId,
                title: t.title,
                status: t.isPublic ? 'Published' : 'Draft',
                views: Math.floor(Math.random() * 5000), // Mock
                sales: Math.floor(Math.random() * 200), // Mock
                date: new Date(t.startDate).toLocaleDateString()
            }));
        });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'Published': return 'success';
            case 'Draft': return 'medium';
            case 'Under Review': return 'warning';
            default: return 'primary';
        }
    }
}
