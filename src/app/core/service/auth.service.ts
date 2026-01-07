import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private tokenKey = 'wander_token';
    private userKey = 'wander_user';

    private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((response: any) => this.handleAuthResponse(response))
        );
    }

    register(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, data).pipe(
            tap((response: any) => this.handleAuthResponse(response))
        );
    }

    anonymousLogin(): Observable<any> {
        return this.http.post(`${this.apiUrl}/anonymous`, {}).pipe(
            tap((response: any) => this.handleAuthResponse(response))
        );
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.currentUserSubject.next(null);
        // Optional: Call backend logout endpoint if needed
        // this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    getCurrentUser(): any {
        return this.currentUserSubject.value;
    }

    private handleAuthResponse(response: any): void {
        if (response.access_token) {
            localStorage.setItem(this.tokenKey, response.access_token);
            if (response.user) {
                // Store complete user data
                const userData = {
                    ...response.user,
                    isAnonymous: response.user.role === 'guest' || response.user.userId === 'guest'
                };
                localStorage.setItem(this.userKey, JSON.stringify(userData));
                this.currentUserSubject.next(userData);
            }
        }
    }

    private getUserFromStorage(): any {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Check if current user is authenticated (not a guest)
     */
    isAuthenticatedUser(): boolean {
        const user = this.getCurrentUser();
        return !!user && !user.isAnonymous && user.userId !== 'guest';
    }

    /**
     * Get user role
     */
    getUserRole(): string {
        const user = this.getCurrentUser();
        return user?.role || 'guest';
    }
}
