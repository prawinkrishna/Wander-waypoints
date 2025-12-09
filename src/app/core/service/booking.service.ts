import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = `${environment.apiUrl}/bookings`;

    constructor(private http: HttpClient) { }

    createBooking(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    getBooking(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    cancelBooking(id: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/cancel`, {});
    }
}
