import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = `${environment.apiUrl}/reviews`;

    constructor(private http: HttpClient) { }

    addReview(data: any): Observable<any> {
        return this.http.post(this.apiUrl, data);
    }

    getReviews(entityId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${entityId}`);
    }

    updateReview(id: string, data: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, data);
    }

    deleteReview(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
