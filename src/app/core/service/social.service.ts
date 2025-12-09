import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SocialService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    likeEntity(data: { entityId: string, entityType: 'trip' | 'place' | 'post' }): Observable<any> {
        return this.http.post(`${this.apiUrl}/likes`, data);
    }

    unlikeEntity(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/likes/${id}`);
    }

    addComment(data: { entityId: string, entityType: 'trip' | 'place' | 'post', text: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/comments`, data);
    }

    getComments(entityId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/comments/${entityId}`);
    }

    shareEntity(data: { entityId: string, entityType: 'trip' | 'place', sharedWith: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/shares`, data);
    }
}
