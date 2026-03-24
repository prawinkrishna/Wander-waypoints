import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
    revenue: number;
    activeTrips: number;
    pending: number;
    clients: number;
}

export interface ActivityLog {
    text: string;
    time: string;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class AgencyService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/agency/stats`);
    }

    getRecentActivity(): Observable<ActivityLog[]> {
        return this.http.get<ActivityLog[]>(`${this.apiUrl}/agency/activity`);
    }

    getAgencyTrips(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/trip`); // Assuming GET /trip returns user's trips
    }
}
