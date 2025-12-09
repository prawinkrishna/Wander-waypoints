import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  private apiUrl = `${environment.apiUrl}/place`;

  constructor(private http: HttpClient) { }

  getPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(this.apiUrl);
  }

  getPlace(id: string): Observable<Place> {
    return this.http.get<Place>(`${this.apiUrl}/${id}`);
  }

  createPlace(place: Place): Observable<Place> {
    return this.http.post<Place>(this.apiUrl, place);
  }

  updatePlace(id: string, place: Partial<Place>): Observable<Place> {
    return this.http.patch<Place>(`${this.apiUrl}/${id}`, place);
  }

  deletePlace(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
