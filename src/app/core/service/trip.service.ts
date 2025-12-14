import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TripService {
    private apiUrl = `${environment.apiUrl}/trip`;

    constructor(private http: HttpClient) { }

    createTrip(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    getTrips(filters?: any): Observable<any[]> {
        let params = new HttpParams();
        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    params = params.set(key, filters[key]);
                }
            });
        }
        return this.http.get<any[]>(this.apiUrl, { params });
    }

    getTrip(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    updateTrip(id: string, data: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, data);
    }

    deleteTrip(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    likeTrip(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/like`, {});
    }

    commentOnTrip(id: string, comment: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/comment`, { text: comment });
    }

    deleteTripPlace(tripPlaceId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/place/${tripPlaceId}`);
    }

    reorderTripPlaces(tripId: string, orderedIds: string[]): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${tripId}/reorder`, { orderedIds });
    }
}
