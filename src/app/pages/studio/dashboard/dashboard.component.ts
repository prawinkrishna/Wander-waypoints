import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/service/auth.service';
import { AgentService } from '../../../core/service/agent.service';

interface DashboardStats {
    totalItineraries: number;
    thisMonth: number;
    drafts: number;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    userName = '';
    stats: DashboardStats = {
        totalItineraries: 0,
        thisMonth: 0,
        drafts: 0
    };
    recentItineraries: any[] = [];
    isLoading = true;
    isAgencyUser = false;

    constructor(
        private authService: AuthService,
        private agentService: AgentService,
        private router: Router
    ) {}

    ngOnInit() {
        this.isAgencyUser = this.authService.isAgencyUser();
        this.loadUserInfo();
        if (this.isAgencyUser) {
            this.loadDashboardData();
        } else {
            this.isLoading = false;
        }
    }

    private loadUserInfo() {
        const user = this.authService.getCurrentUser();
        this.userName = user?.name || user?.email?.split('@')[0] || 'User';
    }

    private loadDashboardData() {
        this.isLoading = true;
        this.agentService.getMyItineraries().subscribe({
            next: (itineraries) => {
                // Calculate stats
                this.stats.totalItineraries = itineraries.length;

                // Calculate this month's itineraries
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                this.stats.thisMonth = itineraries.filter(i => {
                    const createdAt = new Date(i.createdAt);
                    return createdAt >= startOfMonth;
                }).length;

                // Count drafts (not shared or finalized)
                this.stats.drafts = itineraries.filter(i =>
                    !i.isShared && i.itineraryStatus !== 'finalized'
                ).length;

                // Get recent itineraries (last 5)
                this.recentItineraries = itineraries
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);

                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading dashboard data:', error);
                this.isLoading = false;
            }
        });
    }

    createNewItinerary() {
        this.router.navigate(['/studio/create-itinerary']);
    }

    viewAllItineraries() {
        this.router.navigate(['/studio/itineraries']);
    }

    editItinerary(tripId: string) {
        this.router.navigate(['/studio/edit-itinerary', tripId]);
    }

    navigateToSettings() {
        this.router.navigate(['/settings']);
    }

    browseTrips() {
        this.router.navigate(['/trip-feed']);
    }

    formatDate(date: string): string {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    getStatusLabel(itinerary: any): string {
        if (itinerary.itineraryStatus === 'finalized') return 'Finalized';
        if (itinerary.itineraryStatus === 'approved') return 'Approved';
        if (itinerary.isShared) return 'Shared';
        return 'Draft';
    }

    getStatusClass(itinerary: any): string {
        if (itinerary.itineraryStatus === 'finalized') return 'status-finalized';
        if (itinerary.itineraryStatus === 'approved') return 'status-approved';
        if (itinerary.isShared) return 'status-shared';
        return 'status-draft';
    }
}
