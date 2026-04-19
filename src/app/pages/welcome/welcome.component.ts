import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { BRAND } from '../../core/brand.config';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
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

    constructor(private router: Router, private seo: SeoService) {}

    ngOnInit(): void {
        // Welcome is the public landing page — use the brand default title
        // (no suffix), the full marketing description, and inject Organization
        // + WebSite JSON-LD so Google can render rich snippets if it picks
        // them up.
        this.seo.setMetaTags({
            description:
                'Plan trips with AI, discover destinations, and create journeys worth sharing. Trekio is the all-in-one platform for travelers and travel agents.',
            path: '/welcome',
            type: 'website',
        });

        this.seo.setStructuredData({
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'Organization',
                    '@id': `${BRAND.url}/#organization`,
                    name: BRAND.seo.organization.legalName,
                    url: BRAND.url,
                    logo: `${BRAND.url}${BRAND.logo.icon}`,
                    foundingDate: BRAND.seo.organization.foundingDate,
                    sameAs: BRAND.seo.organization.sameAs,
                },
                {
                    '@type': 'WebSite',
                    '@id': `${BRAND.url}/#website`,
                    url: BRAND.url,
                    name: BRAND.name,
                    description: BRAND.description,
                    publisher: { '@id': `${BRAND.url}/#organization` },
                    inLanguage: 'en-IN',
                },
            ],
        });
    }

    navigateToLogin() {
        this.router.navigate(['/login']);
    }

    navigateToRegister() {
        this.router.navigate(['/login'], { queryParams: { mode: 'register' } });
    }
}
