import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { AuthService } from '../../core/service/auth.service';
import { MapService, SearchLocation } from '../../core/service/map.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  searchControl = new FormControl();
  filteredOptions: SearchLocation[] = [];
  provider = new OpenStreetMapProvider();

  constructor(
    private authService: AuthService,
    private router: Router,
    private mapService: MapService
  ) {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap(async (value) => {
          if (typeof value !== 'string' || value.length < 3) return [];
          try {
            return await this.mapService.searchPlaces(value).toPromise();
          } catch (error) {
            console.error('Search error', error);
            return [];
          }
        })
      )
      .subscribe((results: any[]) => {
        this.filteredOptions = results;
      });
  }

  get isGuest(): boolean {
    return !this.authService.isAuthenticatedUser();
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }

  displayFn(location: SearchLocation): string {
    return location && location.label ? location.label : '';
  }

  onOptionSelected(event: any) {
    const location: SearchLocation = event.option.value;
    this.mapService.selectLocation(location);

    // Navigate to home if not already there
    if (this.router.url !== '/home') {
      this.router.navigate(['/home']);
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onLogin() {
    this.router.navigate(['/login']);
  }
}
