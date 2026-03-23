import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TravelerDetail {
    name: string;
    age?: number;
    gender?: string;
}

export interface CreateBookingRequest {
    tripId: string;
    travelDate: string;
    numberOfTravelers: number;
    travelerDetails?: TravelerDetail[];
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    specialRequests?: string;
}

export interface Booking {
    bookingId: string;
    userId: string;
    tripId: string;
    agencyId: string;
    travelDate: Date;
    numberOfTravelers: number;
    travelerDetails: TravelerDetail[];
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    specialRequests: string;
    pricePerPerson: number;
    totalAmount: number;
    platformCommission: number;
    currency: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
    paymentId: string;
    paymentOrderId: string;
    paymentStatus: string;
    paidAt: Date;
    createdAt: Date;
    updatedAt: Date;
    cancelledAt: Date;
    cancellationReason: string;
    trip?: any;
    agency?: any;
    user?: any;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = `${environment.apiUrl}/bookings`;

    constructor(private http: HttpClient) { }

    createBooking(data: CreateBookingRequest): Observable<Booking> {
        return this.http.post<Booking>(this.apiUrl, data);
    }

    getBooking(id: string): Observable<Booking> {
        return this.http.get<Booking>(`${this.apiUrl}/${id}`);
    }

    getMyBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/my-bookings`);
    }

    getBookingsByTrip(tripId: string): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/trip/${tripId}`);
    }

    getBookingsByAgency(agencyId: string): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/agency/${agencyId}`);
    }

    cancelBooking(id: string, reason?: string): Observable<Booking> {
        return this.http.put<Booking>(`${this.apiUrl}/${id}/cancel`, { cancellationReason: reason });
    }

    confirmPayment(id: string, paymentId: string, paymentOrderId: string, signature?: string): Observable<Booking> {
        return this.http.post<Booking>(`${this.apiUrl}/${id}/confirm-payment`, {
            paymentId,
            paymentOrderId,
            signature
        });
    }

    updateBooking(id: string, data: Partial<CreateBookingRequest>): Observable<Booking> {
        return this.http.patch<Booking>(`${this.apiUrl}/${id}`, data);
    }
}

