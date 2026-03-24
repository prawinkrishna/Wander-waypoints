import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent {
    activeAudience: 'travelers' | 'agents' = 'travelers';

    consumerFeatures = [
        {
            icon: 'explore',
            title: 'Discover Trips',
            description: 'Browse curated itineraries from real travelers and professional agents worldwide.'
        },
        {
            icon: 'auto_awesome',
            title: 'AI Trip Planner',
            description: 'Tell us where you want to go and our AI builds a complete day-by-day travel plan.'
        },
        {
            icon: 'group',
            title: 'Social Travel',
            description: 'Follow travelers, share your journeys, and get inspired by the community.'
        }
    ];

    agentFeatures = [
        {
            icon: 'auto_awesome',
            title: 'AI-Powered Generation',
            description: 'Enter trip details, get complete day-wise itineraries with hotels, transport, and pricing in seconds.'
        },
        {
            icon: 'picture_as_pdf',
            title: 'Professional PDF Export',
            description: 'Generate stunning, client-ready documents with your branding that impress every time.'
        },
        {
            icon: 'business',
            title: 'Your Branding',
            description: 'Add your agency logo, terms & conditions, and payment details to every itinerary.'
        }
    ];

    consumerSteps = [
        {
            number: 1,
            title: 'Discover',
            description: 'Browse trips, follow travelers, and find your next destination'
        },
        {
            number: 2,
            title: 'Plan',
            description: 'Use our AI planner or customize any itinerary to fit your style'
        },
        {
            number: 3,
            title: 'Book',
            description: 'Book directly with agents and share your journey with the world'
        }
    ];

    agentSteps = [
        {
            number: 1,
            title: 'Enter Trip Details',
            description: 'Destination, dates, budget, and traveler preferences'
        },
        {
            number: 2,
            title: 'AI Generates Itinerary',
            description: 'Complete day-wise plan with activities, hotels & transport'
        },
        {
            number: 3,
            title: 'Edit & Export PDF',
            description: 'Customize everything and share professional documents'
        }
    ];

    constructor(private router: Router) {}

    navigateToLogin() {
        this.router.navigate(['/login']);
    }

    navigateToRegister() {
        this.router.navigate(['/login'], { queryParams: { mode: 'register' } });
    }
}
