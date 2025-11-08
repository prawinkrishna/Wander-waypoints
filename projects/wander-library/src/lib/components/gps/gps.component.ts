import { isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { Place } from '../../models/place.model';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'lib-gps',
  templateUrl: './gps.component.html',
  styleUrls: ['./gps.component.scss']
})
export class GpsComponent implements OnInit, OnChanges {
  @Input() places: Place[] = [];
  @Input() selectedPlace: Place | null = null;
  @Output() markerClicked = new EventEmitter<string>();
  private map: any;
  private markers: Map<any, any> = new Map();
  private markerClusterGroup!: L.MarkerClusterGroup;

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

  private initMap(): void {
    this.map = L.map('map', {
      center: [13.0827, 80.2707],
      zoom: 10
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markerClusterGroup = L.markerClusterGroup();
    this.map.addLayer(this.markerClusterGroup);

    this.updateMarkers();
  }

  private updateMarkers(): void {
    // Clear existing markers
    this.markerClusterGroup.clearLayers();
    this.markers.clear();

    // Add new markers
    this.places.forEach(place => {
      const marker = L.marker([+place.latitude, +place.longitude]);
      marker.bindPopup(`<b>${place.name}</b>`);
      marker.on('click', () => {
        this.markerClicked.emit(place.placeId);
      });
      this.markers.set(place.placeId, marker);
      this.markerClusterGroup.addLayer(marker);
    });

    if (this.places.length > 0) {
      this.map.fitBounds(this.markerClusterGroup.getBounds());
    }
  }

  private highlightMarker(): void {
    if (this.selectedPlace && this.markerClusterGroup) {
      const marker = this.markers.get(this.selectedPlace.placeId);
      if (marker) {
        this.markerClusterGroup.zoomToShowLayer(marker, () => {
          this.map.setView(marker.getLatLng(), 15);
          marker.openPopup();
        });
      }
    }
  }
}