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
  private userLocationMarker: L.Marker | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

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
      zoom: 10,
      zoomControl: false // We'll add custom controls
    });

    // Add tile layer with better styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    // Add custom zoom control
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    // Add scale control
    L.control.scale({
      position: 'bottomleft'
    }).addTo(this.map);

    // Initialize marker cluster with custom styling
    this.markerClusterGroup = L.markerClusterGroup({
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count > 10) size = 'medium';
        if (count > 50) size = 'large';

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: L.point(40, 40)
        });
      }
    });
    this.map.addLayer(this.markerClusterGroup);

    // Add geolocation button
    this.addGeolocationControl();

    this.updateMarkers();
  }

  private addGeolocationControl(): void {
    const GeolocationControl = L.Control.extend({
      onAdd: (map: any) => {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.innerHTML = '<button class="geolocation-btn" title="Show my location"><span class="material-icons">my_location</span></button>';
        container.style.backgroundColor = 'white';
        container.style.width = '34px';
        container.style.height = '34px';
        container.style.cursor = 'pointer';

        container.onclick = () => {
          this.getUserLocation();
        };

        return container;
      }
    });

    const geolocationControl = new GeolocationControl({ position: 'bottomright' });
    this.map.addControl(geolocationControl);
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Remove existing user location marker
          if (this.userLocationMarker) {
            this.map.removeLayer(this.userLocationMarker);
          }

          // Create custom icon for user location
          const userIcon = L.divIcon({
            html: '<div class="user-location-marker"><span class="material-icons">person_pin_circle</span></div>',
            className: 'user-location-icon',
            iconSize: [30, 30]
          });

          // Add user location marker
          this.userLocationMarker = L.marker([lat, lng], { icon: userIcon })
            .addTo(this.map)
            .bindPopup('<b>You are here</b>')
            .openPopup();

          // Center map on user location
          this.map.setView([lat, lng], 14);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to retrieve your location');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  }

  private getMarkerIcon(category: string): L.DivIcon {
    const categoryLower = category?.toLowerCase() || '';
    let color = '#667eea'; // default purple
    let icon = 'place';

    if (categoryLower.includes('food') || categoryLower.includes('restaurant')) {
      color = '#f59e0b'; // orange
      icon = 'restaurant';
    } else if (categoryLower.includes('sight') || categoryLower.includes('view')) {
      color = '#10b981'; // green
      icon = 'landscape';
    } else if (categoryLower.includes('stay') || categoryLower.includes('hotel')) {
      color = '#3b82f6'; // blue
      icon = 'hotel';
    } else if (categoryLower.includes('activity') || categoryLower.includes('adventure')) {
      color = '#ef4444'; // red
      icon = 'hiking';
    }

    return L.divIcon({
      html: `<div class="custom-marker" style="background-color: ${color}">
               <span class="material-icons">${icon}</span>
             </div>`,
      className: 'custom-marker-icon',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });
  }

  private updateMarkers(): void {
    // Clear existing markers
    this.markerClusterGroup.clearLayers();
    this.markers.clear();

    // Add new markers with custom icons and rich popups
    this.places.forEach(place => {
      const icon = this.getMarkerIcon(place.category);
      const marker = L.marker([+place.latitude, +place.longitude], { icon });

      // Create rich popup content
      const popupContent = `
        <div class="map-popup">
          <h3>${place.name}</h3>
          <div class="popup-category">${place.category || 'Other'}</div>
          <p class="popup-location">${place.location || ''}</p>
          ${place.description ? `<p class="popup-description">${place.description}</p>` : ''}
          <button class="popup-view-btn" data-place-id="${place.placeId}">
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      });

      // Handle popup open to attach button listener
      marker.on('popupopen', (e: any) => {
        const popup = e.popup;
        const button = popup.getElement()?.querySelector('.popup-view-btn');
        if (button) {
          button.addEventListener('click', (event: Event) => {
            event.stopPropagation();
            const placeId = (event.target as HTMLElement).getAttribute('data-place-id');
            if (placeId) {
              this.markerClicked.emit(placeId);
            }
          });
        }
      });

      this.markers.set(place.placeId, marker);
      this.markerClusterGroup.addLayer(marker);
    });

    if (this.places.length > 0) {
      this.map.fitBounds(this.markerClusterGroup.getBounds(), { padding: [50, 50] });
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