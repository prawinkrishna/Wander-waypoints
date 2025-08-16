import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { Place } from '../../core/service/model.service';

@Component({
  selector: 'app-gps',
  templateUrl: './gps.component.html',
  styleUrls: ['./gps.component.scss']
})
export class GpsComponent implements OnInit, OnChanges {
  @Input() places: Place[] = [];
  @Input() selectedPlace: Place | null = null;
  private map: any;
  private markers: Map<number, any> = new Map();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      if (changes['places']) {
        this.updateMarkers();
      }
      if (changes['selectedPlace']) {
        this.highlightMarker();
      }
    }
  }

  private async initMap(): Promise<void> {
    const L = await import('leaflet');

    this.map = L.map('map', {
      center: [13.0827, 80.2707],
      zoom: 10
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.updateMarkers();
  }

  private async updateMarkers(): Promise<void> {
    const L = await import('leaflet');

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();

    // Add new markers
    this.places.forEach(place => {
      const marker = L.marker([place.lat, place.lng]).addTo(this.map);
      marker.bindPopup(`<b>${place.name}</b>`);
      this.markers.set(place.id, marker);
    });

    if (this.places.length > 0) {
      const group = L.featureGroup(Array.from(this.markers.values()));
      this.map.fitBounds(group.getBounds());
    }
  }

  private highlightMarker(): void {
    if (this.selectedPlace) {
      const marker = this.markers.get(this.selectedPlace.id);
      if (marker) {
        this.map.setView(marker.getLatLng(), 15);
        marker.openPopup();
      }
    }
  }
}
