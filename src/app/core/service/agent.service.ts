import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AgentTripPreferences {
    destination: string;
    duration: number;
    budget?: string;
    budgetCategory?: 'budget' | 'mid-range' | 'luxury';
    tripType?: 'solo' | 'couple' | 'family' | 'group';
    interests?: string[];
    clientName?: string;
    travelers?: number;
    startDate?: string;
    specialRequirements?: string;
}

export interface AgentHotelSuggestion {
    hotel_name: string;
    star_rating?: number;
    room_type?: string;
    per_night_cost?: number;
    location?: string;
    amenities?: string[];
}

export interface AgentTransportSuggestion {
    type: string;
    route: string;
    estimated_cost?: number;
    duration?: string;
    recommended_operator?: string;
}

export interface AgentActivityItem {
    start_time: string;
    end_time: string;
    activity_title: string;
    description: string;
    place_name: string;
    place_address?: string;
    category?: string;
    estimated_cost?: number;
    tips?: string;
}

export interface AgentTripDay {
    day_number: number;
    date?: string;
    theme: string;
    activities: AgentActivityItem[];
}

export interface AgentBudgetItem {
    category: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface AgentTripResponse {
    trip_title: string;
    summary: string;
    destination: string;
    duration_days: number;
    duration_nights: number;
    travelers: number;
    itinerary: AgentTripDay[];
    recommended_hotels: AgentHotelSuggestion[];
    transport_suggestions: AgentTransportSuggestion[];
    budget_breakdown: AgentBudgetItem[];
    estimated_total: number;
    inclusions: string[];
    exclusions: string[];
    best_time_to_visit?: string;
    travel_tips?: string[];
}

export interface Accommodation {
    hotelName: string;
    starRating?: number;
    roomType?: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    perNightCost?: number;
    totalCost?: number;
    address?: string;
    contactNumber?: string;
    bookingReference?: string;
}

export interface TransportSegment {
    type: string;
    route: string;
    date: string;
    time?: string;
    operator?: string;
    bookingReference?: string;
    cost?: number;
    notes?: string;
}

export interface PricingItem {
    item: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface AgencyProfile {
    agencyId: string;
    name: string;
    description?: string;
    contactEmail: string;
    contactPhone?: string;
    logoUrl?: string;
    tagline?: string;
    address?: string;
    gstNumber?: string;
    websiteUrl?: string;
    termsAndConditions?: string;
    cancellationPolicy?: string;
    paymentTerms?: string;
    bankDetails?: {
        accountName?: string;
        accountNumber?: string;
        bankName?: string;
        ifscCode?: string;
        upiId?: string;
    };
}

export type ClientEditMode = 'none' | 'notes_only' | 'approve_reject' | 'full_edit';
export type ItineraryStatus = 'draft' | 'shared' | 'client_reviewing' | 'changes_requested' | 'approved' | 'finalized';

export interface ShareResponse {
    shareToken: string;
    shareUrl: string;
    isShared: boolean;
    clientEditMode: ClientEditMode;
    shareTokenCreatedAt: Date;
    itineraryStatus: ItineraryStatus;
    shareExpiresAt?: Date;
    hasPassword?: boolean;
}

export interface StatusHistoryEntry {
    status: string;
    timestamp: string;
    actor: 'agent' | 'client';
    message?: string;
}

export interface SharedItinerary {
    tripId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    coverImage?: string;
    places: any[];
    accommodations: Accommodation[];
    transportSegments: TransportSegment[];
    pricingBreakdown: PricingItem[];
    totalCost: number;
    taxAmount: number;
    grandTotal: number;
    inclusions: string[];
    exclusions: string[];
    validUntil?: string;
    clientName?: string;
    specialNotes?: string;
    customTerms?: string;
    clientEditMode: ClientEditMode;
    itineraryStatus: ItineraryStatus;
    statusHistory?: StatusHistoryEntry[];
    requiresPassword?: boolean;
    agency?: {
        name: string;
        logoUrl?: string;
        contactEmail?: string;
        contactPhone?: string;
        tagline?: string;
        termsAndConditions?: string;
        cancellationPolicy?: string;
        paymentTerms?: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AgentService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // AI Generation
    generateItinerary(preferences: AgentTripPreferences): Observable<AgentTripResponse> {
        return this.http.post<AgentTripResponse>(`${this.apiUrl}/ai/generate-agent-trip`, preferences);
    }

    // Trip Management
    saveItinerary(tripId: string, data: {
        accommodations?: Accommodation[];
        transportSegments?: TransportSegment[];
        pricingBreakdown?: PricingItem[];
        totalCost?: number;
        taxAmount?: number;
        grandTotal?: number;
        validUntil?: string;
        clientName?: string;
        clientEmail?: string;
        clientPhone?: string;
        customTerms?: string;
        specialNotes?: string;
        inclusions?: string[];
        exclusions?: string[];
    }): Observable<any> {
        return this.http.patch(`${this.apiUrl}/trip/${tripId}`, data);
    }

    createItinerary(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/trip`, data);
    }

    getItinerary(tripId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/trip/${tripId}`);
    }

    getMyItineraries(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/trip`);
    }

    deleteItinerary(tripId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/trip/${tripId}`);
    }

    // PDF Download
    downloadPdf(tripId: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/pdf/itinerary/${tripId}`, {
            responseType: 'blob'
        });
    }

    previewPdf(tripId: string): string {
        return `${this.apiUrl}/pdf/itinerary/${tripId}/preview`;
    }

    // Agency Profile
    getAgencyProfile(): Observable<AgencyProfile> {
        return this.http.get<AgencyProfile>(`${this.apiUrl}/agency/profile`);
    }

    updateAgencyProfile(data: Partial<AgencyProfile>): Observable<AgencyProfile> {
        return this.http.patch<AgencyProfile>(`${this.apiUrl}/agency/profile`, data);
    }

    uploadLogo(file: File): Observable<{ logoUrl: string }> {
        const formData = new FormData();
        formData.append('logo', file);
        return this.http.post<{ logoUrl: string }>(`${this.apiUrl}/agency/upload-logo`, formData);
    }

    // Trip Place Management
    addTripPlace(tripId: string, placeData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/trip-place`, {
            tripId,
            ...placeData
        });
    }

    updateTripPlace(tripPlaceId: string, data: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/trip-place/${tripPlaceId}`, data);
    }

    deleteTripPlace(tripPlaceId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/trip-place/${tripPlaceId}`);
    }

    reorderTripPlaces(tripId: string, orderedIds: string[]): Observable<any> {
        return this.http.patch(`${this.apiUrl}/trip/${tripId}/reorder`, { orderedIds });
    }

    // ========== SHARING ==========

    enableSharing(tripId: string, clientEditMode: ClientEditMode = 'none', options?: {
        clientEmail?: string;
        clientName?: string;
        expiresAt?: string;
        sharePassword?: string;
    }): Observable<ShareResponse> {
        return this.http.post<ShareResponse>(`${this.apiUrl}/trip/${tripId}/share`, {
            clientEditMode,
            ...options,
        });
    }

    getShareStatus(tripId: string): Observable<ShareResponse | null> {
        return this.http.get<ShareResponse | null>(`${this.apiUrl}/trip/${tripId}/share`);
    }

    updateShareSettings(tripId: string, settings: {
        isShared?: boolean;
        clientEditMode?: ClientEditMode;
        expiresAt?: string;
        sharePassword?: string;
        removePassword?: boolean;
    }): Observable<ShareResponse> {
        return this.http.patch<ShareResponse>(`${this.apiUrl}/trip/${tripId}/share`, settings);
    }

    disableSharing(tripId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/trip/${tripId}/share`);
    }

    regenerateShareToken(tripId: string): Observable<{ shareToken: string; shareUrl: string }> {
        return this.http.post<{ shareToken: string; shareUrl: string }>(`${this.apiUrl}/trip/${tripId}/share/regenerate`, {});
    }

    finalizeItinerary(tripId: string): Observable<{ success: boolean; itineraryStatus: ItineraryStatus }> {
        return this.http.post<{ success: boolean; itineraryStatus: ItineraryStatus }>(`${this.apiUrl}/trip/${tripId}/finalize`, {});
    }

    // Public shared itinerary endpoints (no auth required)
    getSharedItinerary(token: string): Observable<SharedItinerary> {
        return this.http.get<SharedItinerary>(`${this.apiUrl}/shared/${token}`);
    }

    updateSharedItinerary(token: string, data: {
        itineraryStatus?: ItineraryStatus;
        activityNotes?: { tripPlaceId: string; notes: string }[];
        activityApprovals?: { tripPlaceId: string; approved: boolean; notes?: string }[];
        activities?: any[];
        accommodations?: Accommodation[];
        transportSegments?: TransportSegment[];
    }): Observable<SharedItinerary> {
        return this.http.patch<SharedItinerary>(`${this.apiUrl}/shared/${token}`, data);
    }

    updateClientStatus(token: string, status: ItineraryStatus, message?: string): Observable<{ success: boolean; itineraryStatus: ItineraryStatus }> {
        return this.http.post<{ success: boolean; itineraryStatus: ItineraryStatus }>(`${this.apiUrl}/shared/${token}/status`, { status, message });
    }

    verifySharePassword(token: string, password: string): Observable<SharedItinerary> {
        return this.http.post<SharedItinerary>(`${this.apiUrl}/shared/${token}/verify`, { password });
    }
}
