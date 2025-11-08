import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../../projects/wander-library/src/lib/provider/http.service';


@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  

  private apiUrl = 'api/place'; // Assuming the backend runs on port 3000

  constructor(private http: HttpService) {}

  getPlaces(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
