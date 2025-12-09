import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getProfile(): Observable<any> {
        return this.http.get(`${this.apiUrl}/profile`);
    }

    getUser(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    updateProfile(id: string, data: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}`, data);
    }

    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
