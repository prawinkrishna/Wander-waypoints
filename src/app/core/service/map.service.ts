import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface SearchLocation {
    label: string;
    x: number; // longitude
    y: number; // latitude
    bounds?: [[number, number], [number, number]];
    raw?: any; // Raw provider response
}

@Injectable({
    providedIn: 'root'
})
export class MapService {
    private locationSelectedSubject = new Subject<SearchLocation>();
    locationSelected$ = this.locationSelectedSubject.asObservable();

    private currentBoundsSubject = new Subject<[[number, number], [number, number]] | null>();
    currentBounds$ = this.currentBoundsSubject.asObservable();
    private _currentBounds: [[number, number], [number, number]] | null = null;

    constructor(private http: HttpClient) { }

    selectLocation(location: SearchLocation) {
        this.locationSelectedSubject.next(location);
    }

    updateBounds(bounds: [[number, number], [number, number]]) {
        this._currentBounds = bounds;
        this.currentBoundsSubject.next(bounds);
    }

    get currentBounds() {
        return this._currentBounds;
    }

    searchPlaces(query: string) {
        const body = {
            query: query,
            bounds: this._currentBounds
        };
        return this.http.post<any>(`${environment.apiUrl}/place/search-proxy`, body).pipe(
            map(response => {
                if (response && response.places) {
                    return response.places.map((place: any) => ({
                        label: place.displayName?.text || place.formattedAddress,
                        x: place.location.longitude,
                        y: place.location.latitude,
                        raw: place,
                        bounds: null // Google Places doesn't always return bounds easily, can add if needed
                    }));
                }
                return [];
            })
        );
    }
}
