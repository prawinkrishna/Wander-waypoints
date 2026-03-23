import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
    selector: 'app-agency',
    templateUrl: './agency.component.html',
    styleUrls: ['./agency.component.scss']
})
export class AgencyComponent implements OnInit {
    @ViewChild('sidenav') sidenav!: MatSidenav;

    isMobile = false;
    sidenavOpened = true;

    menuItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/agency/dashboard' },
        { label: 'My Trips', icon: 'map', route: '/agency/trips' },
        { label: 'Trip Jams', icon: 'group', route: '/agency/jams' },
        { label: 'Earnings', icon: 'attach_money', route: '/agency/earnings' },
        { label: 'Settings', icon: 'settings', route: '/agency/settings' }
    ];

    constructor(private breakpointObserver: BreakpointObserver) { }

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
}
