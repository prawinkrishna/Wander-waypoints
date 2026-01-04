import { Component, OnInit } from '@angular/core';
import { AgencyService } from '../../../core/service/agency.service';

@Component({
    selector: 'app-agency-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class AgencyDashboardComponent implements OnInit {

    stats: any[] = [];
    recentActivity: any[] = [];

    constructor(private agencyService: AgencyService) { }

    ngOnInit() {
        this.agencyService.getDashboardStats().subscribe(data => {
            this.stats = [
                { title: 'Total Revenue', value: `$${data.revenue.toLocaleString()}`, icon: 'attach_money', color: 'success' },
                { title: 'Active Trips', value: data.activeTrips.toString(), icon: 'map', color: 'primary' },
                { title: 'Pending', value: data.pending.toString(), icon: 'schedule', color: 'warning' },
                { title: 'Clients', value: data.clients.toString(), icon: 'group', color: 'tertiary' }
            ];
        });

        this.agencyService.getRecentActivity().subscribe(data => {
            this.recentActivity = data;
        });
    }

    getIcon(icon: string): string {
        return icon;
    }

    getTint(color: string): string {
        switch (color) {
            case 'success': return 'rgba(76, 175, 80, 0.1)';
            case 'primary': return 'rgba(63, 81, 181, 0.1)';
            case 'warning': return 'rgba(255, 152, 0, 0.1)';
            case 'tertiary': return 'rgba(156, 39, 176, 0.1)';
            default: return 'rgba(0,0,0,0.05)';
        }
    }
}
