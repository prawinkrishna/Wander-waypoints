import { Component } from '@angular/core';

@Component({
    selector: 'app-agency',
    templateUrl: './agency.component.html',
    styleUrls: ['./agency.component.scss']
})
export class AgencyComponent {

    menuItems = [
        { label: 'Dashboard', icon: 'dashboard', route: '/agency/dashboard' },
        { label: 'My Trips', icon: 'map', route: '/agency/trips' },
        { label: 'Trip Jams', icon: 'group', route: '/agency/jams' },
        { label: 'Earnings', icon: 'attach_money', route: '/agency/earnings' },
        { label: 'Settings', icon: 'settings', route: '/agency/settings' }
    ];

    constructor() { }
}
