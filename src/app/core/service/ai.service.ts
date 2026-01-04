import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AiService {
    // Pointing to NestJS Gateway
    private apiUrl = 'http://localhost:3000/api/ai/generate-trip';

    constructor(private http: HttpClient) { }

    generateTrip(prompt: string): Observable<any> {
        // Basic parsing of prompt to mock preferences for now
        // In a real app, we might extract entities or ask more questions.
        const payload = {
            destination: prompt,
            duration_days: 3,
            budget: 'Medium',
            interests: ['Exploration'],
            travel_style: 'Balanced'
        };

        return this.http.post(this.apiUrl, payload);
    }
}
