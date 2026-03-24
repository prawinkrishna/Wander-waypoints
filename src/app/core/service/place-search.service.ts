import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PlaceSearchResult {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    placeId?: string;
    raw?: any;
}

export interface ParsedPlaceResponse {
    success: boolean;
    place?: {
        name: string;
        address: string;
        latitude: number;
        longitude: number;
        googlePlaceId?: string;
    };
    error?: string;
}

export interface AutocompleteResult {
    placeId: string;
    description: string;
    mainText: string;
    secondaryText: string;
}

@Injectable({
    providedIn: 'root'
})
export class PlaceSearchService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    searchPlaces(query: string, bounds?: [[number, number], [number, number]]): Observable<PlaceSearchResult[]> {
        if (!query || query.length < 2) {
            return of([]);
        }

        const body = { query, bounds };
        return this.http.post<any>(`${this.apiUrl}/place/search-proxy`, body).pipe(
            map(response => {
                if (response && response.places) {
                    return response.places.map((place: any) => ({
                        name: place.displayName?.text || place.formattedAddress?.split(',')[0] || 'Unknown',
                        address: place.formattedAddress || '',
                        latitude: place.location?.latitude || 0,
                        longitude: place.location?.longitude || 0,
                        placeId: place.id,
                        raw: place
                    }));
                }
                return [];
            }),
            catchError(error => {
                console.error('Search places error:', error);
                return of([]);
            })
        );
    }

    parseMapsUrl(url: string): Observable<ParsedPlaceResponse> {
        return this.http.post<ParsedPlaceResponse>(`${this.apiUrl}/geocoding/parse-maps-url`, { url }).pipe(
            catchError(error => {
                console.error('Parse maps URL error:', error);
                return of({
                    success: false,
                    error: error.error?.message || 'Failed to parse Google Maps URL'
                });
            })
        );
    }

    getPlaceAutocomplete(query: string): Observable<AutocompleteResult[]> {
        if (!query || query.length < 2) {
            return of([]);
        }

        return this.http.get<any[]>(`${this.apiUrl}/geocoding/autocomplete`, {
            params: { q: query }
        }).pipe(
            map(predictions => {
                if (!predictions) return [];
                return predictions.map(p => ({
                    placeId: p.place_id,
                    description: p.description,
                    mainText: p.structured_formatting?.main_text || p.description.split(',')[0],
                    secondaryText: p.structured_formatting?.secondary_text || ''
                }));
            }),
            catchError(error => {
                console.error('Autocomplete error:', error);
                return of([]);
            })
        );
    }

    getPlaceDetails(placeId: string): Observable<PlaceSearchResult | null> {
        return this.http.get<any>(`${this.apiUrl}/geocoding/place-details`, {
            params: { placeId }
        }).pipe(
            map(result => {
                if (!result) return null;
                return {
                    name: result.name || '',
                    address: result.formatted_address || '',
                    latitude: result.geometry?.location?.lat || 0,
                    longitude: result.geometry?.location?.lng || 0,
                    placeId: placeId
                };
            }),
            catchError(error => {
                console.error('Get place details error:', error);
                return of(null);
            })
        );
    }
}
