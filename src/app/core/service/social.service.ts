import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SocialService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getFriendFootprints(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users/footprints`);
    }

    getTrendingTrips(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/trip/trending`);
    }

    getPublicProfile(userId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/users/${userId}/public-profile`);
    }

    followUser(userId: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/users/${userId}/follow`, {});
    }

    unfollowUser(userId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/users/${userId}/follow`);
    }

    updateProfile(userId: string, data: any): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, data);
    }

    getFollowStatus(userId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/users/${userId}/follow-status`);
    }

    getPendingRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users/me/pending-requests`);
    }

    acceptFollowRequest(requestId: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/users/requests/${requestId}/accept`, {});
    }

    rejectFollowRequest(requestId: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/users/requests/${requestId}/reject`, {});
    }
}
