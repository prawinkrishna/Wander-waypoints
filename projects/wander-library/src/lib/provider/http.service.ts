import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private baseUrl = 'http://localhost:3000'; // Replace with your API base URL

  constructor(private http: HttpClient) {}

  /**
   * GET request
   * @param endpoint API endpoint
   * @param params Optional query parameters
   * @returns Observable of the response
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params });
  }

  /**
   * POST request
   * @param endpoint API endpoint
   * @param body Request body
   * @param headers Optional headers
   * @returns Observable of the response
   */
  post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }

  /**
   * PUT request
   * @param endpoint API endpoint
   * @param body Request body
   * @param headers Optional headers
   * @returns Observable of the response
   */
  put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }

  /**
   * DELETE request
   * @param endpoint API endpoint
   * @param params Optional query parameters
   * @returns Observable of the response
   */
  delete<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { params });
  }
}
