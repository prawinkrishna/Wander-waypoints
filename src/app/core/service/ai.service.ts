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
    origin?: string;
    start_date?: string;
    arrival_time?: string;
    airport_transfer_mins?: number;
    extracted_places?: ExtractedPlace[];
    inter_city_transport?: string;
    local_transport_modes?: string[];
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

export interface TripExtrasRequest {
    destination: string;
    duration: number;
    trip_type?: string;
    budget?: string;
    origin?: string;
    interests?: string[];
}

export interface TripExtras {
    pre_trip_checklist: {
        visa_info: string;
        passport_requirements: string;
        vaccinations: string;
        travel_insurance: string;
        currency_tips: string;
        emergency_contacts: { embassy: string; tourist_police: string; hospital: string; emergency_number: string };
    };
    budget_estimate: {
        currency: string;
        breakdown: { category: string; amount: number; note: string }[];
        estimated_total: number;
        per_person: boolean;
    };
    packing_list: {
        documents: string[];
        clothing: string[];
        electronics: string[];
        toiletries: string[];
        medications: string[];
        extras: string[];
    };
    local_tips: {
        culture: string[];
        food: string[];
        transport: string[];
        safety: string[];
        useful_phrases: { phrase: string; local: string; pronunciation: string }[];
    };
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

    generateTripExtras(request: TripExtrasRequest): Observable<TripExtras> {
        return this.http.post<TripExtras>(`${environment.apiUrl}/ai/generate-trip-extras`, request);
    }

    generateTripV2(params: TripGenerationParams): Observable<any> {
        const body: any = {
            destination: params.destination,
            duration_days: params.duration_days,
            budget: params.budget,
            interests: params.interests,
            travel_style: params.travel_style,
            transport_preference: params.transport_preference,
            origin: params.origin,
            start_date: params.start_date,
            arrival_time: params.arrival_time,
            airport_transfer_mins: params.airport_transfer_mins,
        };
        if (params.extracted_places?.length) {
            body.extracted_places = params.extracted_places;
        }
        if (params.inter_city_transport) {
            body.inter_city_transport = params.inter_city_transport;
        }
        if (params.local_transport_modes?.length) {
            body.local_transport_modes = params.local_transport_modes;
        }
        return this.http.post<any>(`${environment.apiUrl}/ai/generate-trip-v2`, body);
    }
}
