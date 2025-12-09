import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ItineraryService {
    private apiUrl = `${environment.apiUrl}/itinerary`;

    constructor(private http: HttpClient) { }

    addItineraryItem(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    getItinerary(tripId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${tripId}`);
    }

    updateItineraryItem(id: string, data: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, data);
    }

    deleteItineraryItem(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
