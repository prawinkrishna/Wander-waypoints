import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// ========== INTERFACES ==========

export type TripRequestStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type TripType = 'solo' | 'couple' | 'group' | 'family';
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type SenderRole = 'traveler' | 'agent';

export interface TripRequest {
    tripRequestId: string;
    title: string;
    description: string;
    destination: string;
    startDate: string;
    endDate: string;
    budgetMin?: number;
    budgetMax?: number;
    currency: string;
    numberOfTravelers: number;
    tripType: TripType;
    preferences?: Record<string, any>;
    status: TripRequestStatus;
    bidCount?: number;
    user?: {
        userId: string;
        username: string;
        profileImage?: string;
    };
    bids?: Bid[];
    createdAt: string;
    updatedAt: string;
}

export interface Bid {
    bidId: string;
    proposedPrice: number;
    currency: string;
    description: string;
    status: BidStatus;
    validUntil?: string;
    itinerary?: { tripId: string };
    agency?: AgentProfile;
    user?: {
        userId: string;
        username: string;
        email?: string;
    };
    tripRequest?: TripRequest;
    messages?: BidMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface BidMessage {
    messageId: string;
    senderRole: SenderRole;
    content: string;
    sender?: {
        userId: string;
        username: string;
        profileImage?: string;
    };
    createdAt: string;
}

export interface AgentProfile {
    agencyId: string;
    name: string;
    description?: string;
    contactEmail: string;
    contactPhone?: string;
    logoUrl?: string;
    tagline?: string;
    address?: string;
    websiteUrl?: string;
    specializations?: string[];
    yearsOfExperience?: number;
    completedTrips?: number;
    averageRating?: number;
    responseTimeHours?: number;
    bio?: string;
    isVerified?: boolean;
    verifiedAt?: string;
}

export interface CreateTripRequestData {
    title: string;
    description: string;
    destination: string;
    startDate: string;
    endDate: string;
    budgetMin?: number;
    budgetMax?: number;
    currency?: string;
    numberOfTravelers?: number;
    tripType?: TripType;
    preferences?: Record<string, any>;
}

export interface CreateBidData {
    proposedPrice: number;
    currency?: string;
    description: string;
    itineraryId?: string;
    validUntil?: string;
}

export interface TripRequestFilters {
    destination?: string;
    tripType?: TripType;
    budgetMin?: number;
    budgetMax?: number;
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// ========== SERVICE ==========

@Injectable({
    providedIn: 'root'
})
export class MarketplaceService {
    private apiUrl = `${environment.apiUrl}/marketplace`;

    constructor(private http: HttpClient) {}

    // ========== TRIP REQUESTS ==========

    createRequest(data: CreateTripRequestData): Observable<TripRequest> {
        return this.http.post<TripRequest>(`${this.apiUrl}/requests`, data);
    }

    listRequests(filters?: TripRequestFilters): Observable<PaginatedResponse<TripRequest>> {
        let params = new HttpParams();
        if (filters) {
            if (filters.destination) params = params.set('destination', filters.destination);
            if (filters.tripType) params = params.set('tripType', filters.tripType);
            if (filters.budgetMin) params = params.set('budgetMin', filters.budgetMin.toString());
            if (filters.budgetMax) params = params.set('budgetMax', filters.budgetMax.toString());
            if (filters.page) params = params.set('page', filters.page.toString());
            if (filters.limit) params = params.set('limit', filters.limit.toString());
        }
        return this.http.get<PaginatedResponse<TripRequest>>(`${this.apiUrl}/requests`, { params });
    }

    getMyRequests(): Observable<TripRequest[]> {
        return this.http.get<TripRequest[]>(`${this.apiUrl}/my-requests`);
    }

    getRequest(id: string): Observable<TripRequest> {
        return this.http.get<TripRequest>(`${this.apiUrl}/requests/${id}`);
    }

    updateRequest(id: string, data: Partial<CreateTripRequestData>): Observable<TripRequest> {
        return this.http.patch<TripRequest>(`${this.apiUrl}/requests/${id}`, data);
    }

    cancelRequest(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/requests/${id}`);
    }

    // ========== BIDS ==========

    submitBid(tripRequestId: string, data: CreateBidData): Observable<Bid> {
        return this.http.post<Bid>(`${this.apiUrl}/requests/${tripRequestId}/bids`, data);
    }

    listBids(tripRequestId: string): Observable<Bid[]> {
        return this.http.get<Bid[]>(`${this.apiUrl}/requests/${tripRequestId}/bids`);
    }

    getMyBids(): Observable<Bid[]> {
        return this.http.get<Bid[]>(`${this.apiUrl}/my-bids`);
    }

    getBid(bidId: string): Observable<Bid> {
        return this.http.get<Bid>(`${this.apiUrl}/bids/${bidId}`);
    }

    updateBid(bidId: string, data: Partial<CreateBidData>): Observable<Bid> {
        return this.http.patch<Bid>(`${this.apiUrl}/bids/${bidId}`, data);
    }

    withdrawBid(bidId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/bids/${bidId}`);
    }

    acceptBid(bidId: string): Observable<Bid> {
        return this.http.post<Bid>(`${this.apiUrl}/bids/${bidId}/accept`, {});
    }

    rejectBid(bidId: string): Observable<Bid> {
        return this.http.post<Bid>(`${this.apiUrl}/bids/${bidId}/reject`, {});
    }

    // ========== MESSAGES ==========

    sendMessage(bidId: string, content: string): Observable<BidMessage> {
        return this.http.post<BidMessage>(`${this.apiUrl}/bids/${bidId}/messages`, { content });
    }

    getMessages(bidId: string): Observable<BidMessage[]> {
        return this.http.get<BidMessage[]>(`${this.apiUrl}/bids/${bidId}/messages`);
    }

    // ========== AGENTS ==========

    listAgents(page = 1, limit = 20): Observable<{ data: AgentProfile[]; total: number }> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<{ data: AgentProfile[]; total: number }>(`${this.apiUrl}/agents`, { params });
    }

    getAgentProfile(agencyId: string): Observable<AgentProfile> {
        return this.http.get<AgentProfile>(`${this.apiUrl}/agents/${agencyId}`);
    }

    updateMyAgentProfile(data: Partial<AgentProfile>): Observable<AgentProfile> {
        return this.http.patch<AgentProfile>(`${this.apiUrl}/agents/me`, data);
    }
}
