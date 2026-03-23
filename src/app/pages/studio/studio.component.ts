import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

@Component({
    selector: 'app-studio',
    templateUrl: './studio.component.html',
    styleUrls: ['./studio.component.scss']
})
export class StudioComponent implements OnInit {
    @ViewChild('sidenav') sidenav!: MatSidenav;

    isMobile = false;
    sidenavOpened = true;

    menuItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/studio/dashboard' },
        { label: 'Create Itinerary', icon: 'add_circle', route: '/studio/create-itinerary' },
        { label: 'My Itineraries', icon: 'list_alt', route: '/studio/itineraries' },
        { icon: 'storefront', label: 'Marketplace', route: '/studio/marketplace' },
        { icon: 'gavel', label: 'My Bids', route: '/studio/marketplace/my-bids' },
        { label: 'Agency Settings', icon: 'business', route: '/studio/settings' },
    ];

    constructor(
        private breakpointObserver: BreakpointObserver,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
            .subscribe(result => {
                this.isMobile = result.matches;
                this.sidenavOpened = !this.isMobile;
            });
    }

    toggleSidenav() {
        this.sidenav.toggle();
    }

    closeSidenavOnMobile() {
        if (this.isMobile) {
            this.sidenav.close();
        }
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/welcome']);
    }
}
