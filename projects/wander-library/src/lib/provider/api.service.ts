import { Injectable } from '@angular/core';
import { HttpService } from '../provider/http.service';
import { Observable } from 'rxjs';
import { HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpService) {}

  // User APIs
  getUsers(): Observable<any> {
    return this.http.get('api/users');
  }
  getUser(id: string): Observable<any> {
    return this.http.get(`api/users/${id}`);
  }
  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`api/users/${id}`, data);
  }
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`api/users/${id}`);
  }
  registerUser(data: any): Observable<any> {
    return this.http.post('api/auth/register', data);
  }
  loginUser(data: any): Observable<any> {
    return this.http.post('api/auth/login', data);
  }
  logoutUser(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post('api/auth/logout', {}, headers);
  }
  getProfile(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.getWithOptions('api/users/profile', { headers });
  }

  // Trip APIs
  getTrips(userId?: string): Observable<any> {
    let params;
    if (userId) {
      params = new HttpParams().set('userId', userId);
    }
    return this.http.get('api/trip', params);
  }
  getTrip(id: string): Observable<any> {
    return this.http.get(`api/trip/${id}`);
  }
  createTrip(data: any): Observable<any> {
    return this.http.post('api/trip', data);
  }
  updateTrip(id: string, data: any): Observable<any> {
    return this.http.put(`api/trip/${id}`, data);
  }
  deleteTrip(id: string): Observable<any> {
    return this.http.delete(`api/trip/${id}`);
  }
  likeTrip(id: string, userId: string): Observable<any> {
    return this.http.post(`api/trip/${id}/like`, { userId });
  }
  commentOnTrip(id: string, userId: string, content: string): Observable<any> {
    return this.http.post(`api/trip/${id}/comment`, { userId, content });
  }

  // Place APIs
  getPlaces(): Observable<any> {
    return this.http.get('api/place');
  }
  getPlace(id: string): Observable<any> {
    return this.http.get(`api/place/${id}`);
  }
  createPlace(data: any): Observable<any> {
    return this.http.post('api/place', data);
  }
  updatePlace(id: string, data: any): Observable<any> {
    return this.http.put(`api/place/${id}`, data);
  }
  deletePlace(id: string): Observable<any> {
    return this.http.delete(`api/place/${id}`);
  }

  // Post APIs
  getPosts(): Observable<any> {
    return this.http.get('api/post');
  }
  getPost(id: string): Observable<any> {
    return this.http.get(`api/post/${id}`);
  }
  createPost(data: any): Observable<any> {
    return this.http.post('api/post', data);
  }
  updatePost(id: string, data: any): Observable<any> {
    return this.http.put(`api/post/${id}`, data);
  }
  deletePost(id: string): Observable<any> {
    return this.http.delete(`api/post/${id}`);
  }
  likePost(id: string, userId: string): Observable<any> {
    return this.http.post(`api/post/${id}/like`, { userId });
  }
  commentOnPost(id: string, userId: string, content: string): Observable<any> {
    return this.http.post(`api/post/${id}/comment`, { userId, content });
  }

  // Trip-Place APIs
  getTripPlaces(): Observable<any> {
    return this.http.get('api/trip-place');
  }
  getTripPlace(id: string): Observable<any> {
    return this.http.get(`api/trip-place/${id}`);
  }
  createTripPlace(data: any): Observable<any> {
    return this.http.post('api/trip-place', data);
  }
  updateTripPlace(id: string, data: any): Observable<any> {
    return this.http.put(`api/trip-place/${id}`, data);
  }
  deleteTripPlace(id: string): Observable<any> {
    return this.http.delete(`api/trip-place/${id}`);
  }

  // Travel APIs
  getTravelPaths(): Observable<any> {
    return this.http.get('api/travel/paths');
  }
  createTravelPath(data: any): Observable<any> {
    return this.http.post('api/travel/path', data);
  }
  createWaypoint(data: any): Observable<any> {
    return this.http.post('api/travel/waypoint', data);
  }

  // Reviews APIs
  getReviews(entityId: string): Observable<any> {
    return this.http.get(`api/reviews/${entityId}`);
  }
  createReview(data: any): Observable<any> {
    return this.http.post('api/reviews', data);
  }
  updateReview(id: string, data: any): Observable<any> {
    return this.http.put(`api/reviews/${id}`, data);
  }
  deleteReview(id: string): Observable<any> {
    return this.http.delete(`api/reviews/${id}`);
  }

  // Itinerary APIs
  getItineraries(tripId: string): Observable<any> {
    return this.http.get(`api/itinerary/${tripId}`);
  }
  createItinerary(data: any): Observable<any> {
    return this.http.post('api/itinerary', data);
  }
  updateItinerary(id: string, data: any): Observable<any> {
    return this.http.put(`api/itinerary/${id}`, data);
  }
  deleteItinerary(id: string): Observable<any> {
    return this.http.delete(`api/itinerary/${id}`);
  }

  // Transport APIs
  getTransports(tripId: string): Observable<any> {
    return this.http.get(`api/transport/${tripId}`);
  }
  createTransport(data: any): Observable<any> {
    return this.http.post('api/transport', data);
  }
  updateTransport(id: string, data: any): Observable<any> {
    return this.http.put(`api/transport/${id}`, data);
  }
}
