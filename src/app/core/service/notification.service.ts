import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  relatedEntityId?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  startPolling(): void {
    this.refreshUnreadCount();
    interval(30000).pipe(
      switchMap(() => this.getUnreadCount())
    ).subscribe({
      next: (res) => this.unreadCountSubject.next(res.count),
      error: () => {} // silently ignore polling errors
    });
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (res) => this.unreadCountSubject.next(res.count),
      error: () => {}
    });
  }

  getNotifications(page = 1, limit = 20): Observable<Notification[]> {
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => res.data || res)
    );
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const current = this.unreadCountSubject.value;
        if (current > 0) this.unreadCountSubject.next(current - 1);
      })
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }
}
