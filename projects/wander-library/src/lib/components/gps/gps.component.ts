import { isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, OnDestroy, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { Place } from '../../models/place.model';
import * as L from 'leaflet';
import 'leaflet.markercluster';

@Component({
  selector: 'lib-gps',
  templateUrl: './gps.component.html',
  styleUrls: ['./gps.component.scss']
})
export class GpsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() places: any[] = []; // Can be Place[] or TripPlace[]
  @Input() selectedPlace: Place | null = null;
  @Output() markerClicked = new EventEmitter<string>();
  private map: any;
  private markers: Map<any, any> = new Map();
  private markerClusterGroup!: L.MarkerClusterGroup;
  private routeLayers: L.LayerGroup = L.layerGroup();
  private userLocationMarker: L.Marker | null = null;
  
  // Day colors for route lines and markers
  private dayColors = [
    '#3b82f6', // Day 1: Blue
    '#10b981', // Day 2: Green
    '#f59e0b', // Day 3: Orange
    '#ef4444', // Day 4: Red
    '#8b5cf6', // Day 5: Purple
    '#ec4899', // Day 6: Pink
    '#06b6d4', // Day 7: Cyan
    '#6366f1', // Day 8: Indigo
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) {
      if (changes['places']) {
        this.updateMapContent();
      }
      if (changes['selectedPlace']) {
        this.highlightMarker();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    if (this.map) return;

    setTimeout(() => {
      const mapElement = document.getElementById('map');
      if (!mapElement) return;

      if ((mapElement as any)._leaflet_id) {
        this.map?.remove();
      }

      this.map = L.map('map', {
        center: [13.0827, 80.2707],
        zoom: 10,
        zoomControl: false
      });

      // Use CartoDB Voyager tiles for a cleaner, modern look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
      }).addTo(this.map);

      L.control.zoom({ position: 'bottomright' }).addTo(this.map);
      L.control.scale({ position: 'bottomleft' }).addTo(this.map);

      this.markerClusterGroup = L.markerClusterGroup({
        disableClusteringAtZoom: 12, // Show individual markers sooner
        maxClusterRadius: 30
      });
      this.map.addLayer(this.markerClusterGroup);
      this.map.addLayer(this.routeLayers);

      this.addGeolocationControl();
      this.updateMapContent();
    }, 0);
  }

  private updateMapContent(): void {
    if (!this.map) return;

    // Clear existing layers
    this.markerClusterGroup.clearLayers();
    this.routeLayers.clearLayers();
    this.markers.clear();

    if (!this.places || this.places.length === 0) return;

    // 1. Normalize Data
    // We need to handle both Place[] and TripPlace[]
    // And sort them by dayNumber and order
    const normalizedPlaces = this.places.map((item, index) => {
      // Check if it's a TripPlace (has nested 'place') or direct Place
      const placeData = item.place || item;
      const day = item.dayNumber || 1;
      const order = item.order !== undefined ? item.order : index;
      
      return {
        ...placeData,     // Properties of Place
        _dayNumber: day,  // Internal use
        _order: order,    // Internal use
        _original: item   // Keep reference
      };
    }).sort((a, b) => {
      if (a._dayNumber !== b._dayNumber) return a._dayNumber - b._dayNumber;
      return a._order - b._order;
    });

    // 2. Group by Day for Route Drawing
    const dayGroups = new Map<number, any[]>();
    normalizedPlaces.forEach(p => {
      if (!dayGroups.has(p._dayNumber)) dayGroups.set(p._dayNumber, []);
      dayGroups.get(p._dayNumber)?.push(p);
    });

    // 3. Draw Routes
    dayGroups.forEach((places, dayNum) => {
      const latLngs = places
        .filter(p => p.latitude && p.longitude)
        .map(p => [parseFloat(p.latitude), parseFloat(p.longitude)] as [number, number]);

      if (latLngs.length > 1) {
        const color = this.dayColors[(dayNum - 1) % this.dayColors.length];
        
        // Draw dashed line for route
        L.polyline(latLngs, {
          color: color,
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
          lineCap: 'round'
        }).addTo(this.routeLayers);
        
        // Add arrows or direction indicators could go here
      }
    });

    // 4. Create Markers with Sequence Numbers
    let globalIndex = 0;
    dayGroups.forEach((places, dayNum) => {
        const color = this.dayColors[(dayNum - 1) % this.dayColors.length];
        
        places.forEach((place, index) => {
            if (!place.latitude || !place.longitude) return;
            
            globalIndex++;
            const seqNum = index + 1; // 1-based index per day
            
            // Create Numbered Icon
            const icon = L.divIcon({
                html: `<div class="seq-marker" style="background-color: ${color}; box-shadow: 0 0 0 3px rgba(${this.hexToRgb(color)}, 0.3)">
                         <span>${seqNum}</span>
                         <div class="day-tag">Day ${dayNum}</div>
                       </div>`,
                className: 'custom-seq-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 34], // Bottom point
                popupAnchor: [0, -34]
            });

            const marker = L.marker([+place.latitude, +place.longitude], { icon });
            
             // Determine button text and action
            const isBookable = place.category?.toLowerCase()?.includes('hotel') || 
                               place.category?.toLowerCase()?.includes('stay');
            const actionBtnText = isBookable ? 'Book Now' : 'View Details';
            const actionBtnClass = isBookable ? 'popup-book-btn' : 'popup-view-btn';
      
            // Create rich popup content
            const popupContent = `
              <div class="map-popup">
                <div class="popup-image-container" style="background-image: url('${place.image || 'https://via.placeholder.com/250x150?text=No+Image'}')">
                  <div class="popup-day-badge" style="background-color: ${color}">Day ${dayNum} - Stop ${seqNum}</div>
                  ${place.rating ? `<div class="popup-rating"><span>${place.rating}</span> <span class="material-icons">star</span></div>` : ''}
                </div>
                <div class="popup-content">
                  <h3>${place.name}</h3>
                  <div class="popup-category" style="background-color: ${this.getCategoryColor(place.category)}">
                    ${place.category || 'Place'}
                  </div>
                  <p class="popup-location">${place.address || place.location || ''}</p>
                  ${place.description ? `<p class="popup-description">${place.description}</p>` : ''}
                  <button class="${actionBtnClass}" data-place-id="${place.placeId}" data-book-url="${place.bookingUrl || ''}">
                    ${actionBtnText}
                  </button>
                </div>
              </div>
            `;
      
            marker.bindPopup(popupContent, {
              maxWidth: 260,
              className: 'custom-popup'
            });

             // Handle popup listener
            marker.on('popupopen', (e: any) => {
                const popup = e.popup;
                const button = popup.getElement()?.querySelector('button');
                
                if (button) {
                button.addEventListener('click', (event: Event) => {
                    event.stopPropagation();
                    const placeId = (event.target as HTMLElement).getAttribute('data-place-id');
                    const bookUrl = (event.target as HTMLElement).getAttribute('data-book-url');
                    
                    if (bookUrl && isBookable) {
                    window.open(bookUrl, '_blank');
                    } else if (placeId) {
                    this.markerClicked.emit(placeId);
                    }
                });
                }
            });

            this.markers.set(place.placeId, marker);
            this.markerClusterGroup.addLayer(marker);
        });
    });

    // Fit bounds to show all markers
    if (this.markers.size > 0) {
      this.map.fitBounds(this.markerClusterGroup.getBounds(), { padding: [50, 50] });
    }
  }

  // Helper to convert Hex to RGB for rgba string
  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
      : '0,0,0';
  }

  private getCategoryColor(category: string): string {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('food') || cat.includes('restaurant')) return '#f59e0b';
    if (cat.includes('sight') || cat.includes('museum')) return '#10b981';
    if (cat.includes('stay') || cat.includes('hotel')) return '#3b82f6';
    if (cat.includes('activity')) return '#ef4444';
    return '#667eea';
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

          if (this.userLocationMarker) {
            this.map.removeLayer(this.userLocationMarker);
          }

          const userIcon = L.divIcon({
            html: '<div class="user-location-marker"><span class="material-icons">person_pin_circle</span></div>',
            className: 'user-location-icon',
            iconSize: [30, 30]
          });

          this.userLocationMarker = L.marker([lat, lng], { icon: userIcon })
            .addTo(this.map)
            .bindPopup('<b>You are here</b>')
            .openPopup();

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

  private highlightMarker(): void {
    if (this.selectedPlace && this.markers) {
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