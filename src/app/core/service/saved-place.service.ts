import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SavedPlaceService {
    private apiUrl = `${environment.apiUrl}/users/saved-places`;

    constructor(private http: HttpClient) {}

    getMySavedPlaces(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    savePlace(place: {
        name: string;
        category?: string;
        description?: string;
        reasonToVisit?: string;
        sourceUrl?: string;
        sourceVideoTitle?: string;
        sourcePlatform?: string;
    }): Observable<any> {
        return this.http.post<any>(this.apiUrl, place);
    }

    unsavePlace(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
