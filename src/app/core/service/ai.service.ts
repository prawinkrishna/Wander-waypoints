import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TripGenerationParams {
    destination: string;
    duration_days: number;
    budget?: string;
    interests?: string[];
    travel_style?: string;
    transport_preference?: string;
}

export interface ExtractedPlace {
    name: string;
    category: string;
    description: string;
    reason_to_visit: string;
}

export interface ExtractionResponse {
    video_title: string;
    video_description?: string;
    places: ExtractedPlace[];
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ModifyTripRequest {
    context: {
        destination: string;
        duration_days: number;
        trip_title: string;
        current_itinerary: {
            day_number: number;
            theme?: string;
            activities: {
                place_name: string;
                description?: string;
                time_of_day?: string;
                start_time?: string;
                duration?: number;
                category?: string;
                transport_mode?: string;
                travel_time?: number;
            }[];
        }[];
    };
    user_message: string;
    conversation_history?: ChatMessage[];
    budget?: string;
    travel_style?: string;
}

export interface ModifyTripResponse {
    message: string;
    modified_itinerary: any[];
    changes_summary: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private apiUrl = `${environment.apiUrl}/ai/generate-trip`;

    constructor(private http: HttpClient) { }

    generateTrip(params: TripGenerationParams): Observable<any> {
        return this.http.post(this.apiUrl, params);
    }

    extractPlaces(url: string): Observable<ExtractionResponse> {
        return this.http.post<ExtractionResponse>(`${environment.apiUrl}/ai/extract-places`, { url });
    }

    modifyTrip(request: ModifyTripRequest): Observable<ModifyTripResponse> {
        return this.http.post<ModifyTripResponse>(`${environment.apiUrl}/ai/modify-trip`, request);
    }
}
