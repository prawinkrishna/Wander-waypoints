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
        // Registration no longer auto-logs in - user must verify email first
        return this.http.post(`${this.apiUrl}/register`, data);
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
                    isAnonymous: response.user.role === 'guest' || response.user.userId === 'guest',
                    isEmailVerified: response.user.isEmailVerified ?? true
                };
                localStorage.setItem(this.userKey, JSON.stringify(userData));
                this.currentUserSubject.next(userData);
            }
        }
    }

    private getUserFromStorage(): any {
        const userStr = localStorage.getItem(this.userKey);
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch {
            localStorage.removeItem(this.userKey);
            return null;
        }
    }

    /**
     * Check if current user is authenticated (not a guest)
     */
    isAuthenticatedUser(): boolean {
        const user = this.getCurrentUser();
        return !!user && this.isAuthenticated() && !user.isAnonymous && user.userId !== 'guest';
    }

    /**
     * Get user role
     */
    getUserRole(): string {
        const user = this.getCurrentUser();
        return user?.role || 'guest';
    }

    /**
     * Check if user is an agency/admin user
     */
    isAgencyUser(): boolean {
        const role = this.getUserRole();
        return role === 'agency_admin' || role === 'admin';
    }

    /**
     * Check if the current user has at least one linked agency (Studio access)
     */
    hasAgency(): boolean {
        const user = this.getCurrentUser();
        return !!(user?.hasAgency || (user?.agencies && user.agencies.length > 0));
    }

    /**
     * Check if user is a consumer (explorer, traveler, influencer)
     */
    isConsumerUser(): boolean {
        const role = this.getUserRole();
        return ['explorer', 'traveler', 'influencer'].includes(role);
    }

    /**
     * Get the default route based on user role
     */
    getDefaultRoute(): string {
        return this.isAgencyUser() ? '/studio/dashboard' : '/home';
    }

    /**
     * Refresh user data in localStorage and BehaviorSubject (e.g. after role upgrade)
     */
    refreshUser(userData: any): void {
        const updated = {
            ...userData,
            isAnonymous: userData.role === 'guest' || userData.userId === 'guest',
            isEmailVerified: userData.isEmailVerified ?? true
        };
        localStorage.setItem(this.userKey, JSON.stringify(updated));
        this.currentUserSubject.next(updated);
    }

    /**
     * Check if user's email is verified
     */
    isEmailVerified(): boolean {
        const user = this.getCurrentUser();
        return user?.isEmailVerified ?? true; // Default true for backwards compatibility
    }

    /**
     * Request password reset email
     */
    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email });
    }

    /**
     * Reset password with token
     */
    resetPassword(token: string, newPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
    }

    /**
     * Verify email with token
     * On success, stores the returned JWT and logs in the user
     */
    verifyEmail(token: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/verify-email`, { token }).pipe(
            tap((response: any) => this.handleAuthResponse(response))
        );
    }

    /**
     * Resend verification email
     */
    resendVerificationEmail(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/resend-verification`, { email });
    }
}
