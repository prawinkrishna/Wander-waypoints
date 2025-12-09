import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TransportService {
    private apiUrl = `${environment.apiUrl}/transport`;

    constructor(private http: HttpClient) { }

    addTransport(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    getTransport(tripId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${tripId}`);
    }

    updateTransport(id: string, data: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, data);
    }
}
