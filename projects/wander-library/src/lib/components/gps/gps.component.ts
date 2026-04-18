import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Input, OnChanges, OnInit, OnDestroy, Output, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { Place } from '../../models/place.model';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

@Component({
  selector: 'lib-gps',
  templateUrl: './gps.component.html',
  styleUrls: ['./gps.component.scss']
})
export class GpsComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() places: any[] = []; // Can be Place[] or TripPlace[]
  @Input() searchFn: ((query: string) => Promise<any[]>) | null = null;
  @Input() selectedPlace: Place | null = null;
  @Input() friends: any[] = []; // List of friends
  @Input() emptyMessage: string = '';

  hasMarkers = false;

  @Output() markerClicked = new EventEmitter<string>();
  @Output() mapMoved = new EventEmitter<[[number, number], [number, number]]>();

  private map: any;
  private markers: Map<any, any> = new Map();
  private friendMarkers: L.Marker[] = [];
  private markerClusterGroup!: L.MarkerClusterGroup;
  private routeLayers: L.LayerGroup = L.layerGroup();
  private userLocationMarker: L.Marker | null = null;
  private resizeObserver: ResizeObserver | null = null;

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
      if (changes['friends']) {
        this.renderFriendMarkers();
      }
      if (changes['selectedPlace']) {
        this.highlightMarker();
      }
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    if (this.map) return;

    setTimeout(() => {
      const el = this.mapContainer?.nativeElement;
      if (!el) return;

      this.map = L.map(el, {
        center: [13.0827, 80.2707],
        zoom: 10,
        zoomControl: false,
        minZoom: 3,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0
      });

      this.map.on('moveend', () => {
        const bounds = this.map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        this.mapMoved.emit([[sw.lat, sw.lng], [ne.lat, ne.lng]]);
      });

      // Use CartoDB Voyager tiles for a cleaner, modern look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
        noWrap: true
      }).addTo(this.map);

      L.control.zoom({ position: 'bottomright' }).addTo(this.map);
      L.control.scale({ position: 'bottomleft' }).addTo(this.map);

      this.markerClusterGroup = L.markerClusterGroup({
        disableClusteringAtZoom: 12, // Show individual markers sooner
        maxClusterRadius: 30
      });
      this.map.addLayer(this.markerClusterGroup);
      this.map.addLayer(this.routeLayers);

      // Custom Provider Implementation
      class CustomSearchProvider {
        constructor(private searchFn: (query: string) => Promise<any[]>) { }
        async search(params: { query: string }) {
          return await this.searchFn(params.query);
        }
      }

      // Add Search Control
      // @ts-ignore
      const searchControl = new GeoSearchControl({
        provider: this.searchFn ? new CustomSearchProvider(this.searchFn) : new OpenStreetMapProvider(),
        style: 'bar', // 'button' or 'bar'
        showMarker: true,
        showPopup: false,
        marker: {
          icon: new L.Icon.Default(),
          draggable: false,
        },
        retainZoomLevel: false,
        animateZoom: true,
        keepResult: true,
        searchLabel: 'Search for places...',
      });
      this.map.addControl(searchControl);

      // Fix: Disable click propagation to allow typing in the search box
      setTimeout(() => {
        const searchInput = el.querySelector('.leaflet-control-geosearch form');
        if (searchInput) {
          L.DomEvent.disableClickPropagation(searchInput as HTMLElement);
        }
      }, 500);

      // Observe container resizes to keep tiles rendered correctly
      this.resizeObserver = new ResizeObserver(() => {
        if (this.map) this.map.invalidateSize();
      });
      this.resizeObserver.observe(el);

      this.addGeolocationControl();
      this.updateMapContent();
      this.renderFriendMarkers();
    }, 0);
  }

  private updateMapContent(): void {
    if (!this.map) return;

    // Clear existing layers
    this.markerClusterGroup.clearLayers();
    this.routeLayers.clearLayers();
    this.markers.clear();

    this.hasMarkers = false;
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
        _original: item,  // Keep reference
        _lat: parseFloat(placeData.latitude),
        _lng: parseFloat(placeData.longitude),
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

    // 3. Draw Transport-Aware Route Segments
    dayGroups.forEach((places, dayNum) => {
      const validPlaces = places.filter(p => this.isValidCoord(p._lat, p._lng));
      if (validPlaces.length < 2) return;

      const color = this.dayColors[(dayNum - 1) % this.dayColors.length];

      for (let i = 0; i < validPlaces.length - 1; i++) {
        const from = validPlaces[i];
        const to = validPlaces[i + 1];
        const transportMode = to._original?.transportMode;
        const category = this.getTransportCategory(transportMode);

        let points: [number, number][];
        if (category === 'flight') {
          points = this.generateArcPoints([from._lat, from._lng], [to._lat, to._lng]);
        } else {
          points = [[from._lat, from._lng], [to._lat, to._lng]];
        }

        const polyline = L.polyline(points, this.getRouteStyle(category, color));
        polyline.addTo(this.routeLayers);

        // Tooltip on route hover
        const label = transportMode
          ? `${transportMode}${to._original?.travelDuration ? ' - ' + this.formatDuration(to._original.travelDuration) : ''}`
          : '';
        if (label) {
          polyline.bindTooltip(label, { sticky: true, direction: 'top', className: 'route-tooltip' });
        }

        // Transport icon at midpoint
        this.addTransportIcon(from, to, category, color);
      }
    });

    // 4. Create Markers with Sequence Numbers
    let globalIndex = 0;
    dayGroups.forEach((places, dayNum) => {
      const color = this.dayColors[(dayNum - 1) % this.dayColors.length];

      places.forEach((place, index) => {
        if (!this.isValidCoord(place._lat, place._lng)) return;

        globalIndex++;
        const seqNum = index + 1; // 1-based index per day

        // Create Numbered Icon
        const icon = L.divIcon({
          html: `<div class="pin-marker" style="background-color: ${color}; box-shadow: 0 3px 8px rgba(0,0,0,0.35)">
                         <span class="pin-number">${seqNum}</span>
                         <div class="day-tag">Day ${dayNum}</div>
                       </div>`,
          className: 'custom-pin-marker',
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -42]
        });

        const marker = L.marker([place._lat, place._lng], { icon });

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

    this.hasMarkers = this.markers.size > 0;

    // Fit bounds to show all markers
    if (this.markers.size > 0) {
      const bounds = this.markerClusterGroup.getBounds();
      this.map.invalidateSize();
      setTimeout(() => {
        if (this.map) {
          this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }
      }, 50);
    }
  }

  private renderFriendMarkers(): void {
    if (!this.map) return;

    // Clear existing friend markers
    this.friendMarkers.forEach(marker => marker.remove());
    this.friendMarkers = [];

    if (!this.friends || this.friends.length === 0) return;

    this.friends.forEach(friend => {
      if (!friend.location) return;

      const [lat, lng] = friend.location;
      if (!lat || !lng || (Math.abs(lat) < 0.01 && Math.abs(lng) < 0.01)) return;

      const friendIcon = L.divIcon({
        html: `<div class="friend-marker" style="background-image: url('${friend.avatar}'); border-color: ${friend.isLive ? '#ff3b30' : '#fff'}"></div>`,
        className: 'custom-friend-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([lat, lng], { icon: friendIcon })
        .addTo(this.map)
        .bindPopup(`<b>${friend.name}</b><br>${friend.status || 'Exploring'}`);

      this.friendMarkers.push(marker);
    });
  }

  private isValidCoord(lat: number, lng: number): boolean {
    return !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0);
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

  private getTransportCategory(mode?: string | null): string {
    const m = mode?.toLowerCase()?.trim() || '';
    if (['walk', 'walking'].includes(m)) return 'walk';
    if (['bike', 'bicycle', 'cycling'].includes(m)) return 'bike';
    if (['train', 'metro', 'subway', 'tram', 'rail'].includes(m)) return 'rail';
    if (['flight', 'plane', 'air'].includes(m)) return 'flight';
    if (m.includes('ferry') || m.includes('boat')) return 'ferry';
    return 'road';
  }

  private getRouteStyle(category: string, color: string): L.PolylineOptions {
    const base: L.PolylineOptions = { color, opacity: 0.7, lineCap: 'round', lineJoin: 'round' };
    switch (category) {
      case 'walk':   return { ...base, weight: 3, dashArray: '4, 8' };
      case 'bike':   return { ...base, weight: 3 };
      case 'rail':   return { ...base, weight: 4, dashArray: '12, 6, 2, 6' };
      case 'flight': return { ...base, weight: 2.5, dashArray: '8, 8' };
      case 'ferry':  return { ...base, weight: 3, dashArray: '8, 4, 2, 4' };
      default:       return { ...base, weight: 4 }; // road — solid
    }
  }

  private generateArcPoints(from: [number, number], to: [number, number], numPoints: number = 20): [number, number][] {
    const points: [number, number][] = [];
    const midLat = (from[0] + to[0]) / 2;
    const midLng = (from[1] + to[1]) / 2;
    const dx = to[1] - from[1];
    const dy = to[0] - from[0];
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Control point offset perpendicular to the line
    const offset = dist * 0.2;
    const ctrlLat = midLat + (dx / dist) * offset;
    const ctrlLng = midLng - (dy / dist) * offset;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lat = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * ctrlLat + t * t * to[0];
      const lng = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * ctrlLng + t * t * to[1];
      points.push([lat, lng]);
    }
    return points;
  }

  private formatDuration(minutes: number): string {
    if (!minutes || minutes <= 0) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  }

  private getTransportMaterialIcon(category: string): string {
    switch (category) {
      case 'walk':   return 'directions_walk';
      case 'bike':   return 'directions_bike';
      case 'rail':   return 'directions_railway';
      case 'flight': return 'flight';
      case 'ferry':  return 'directions_boat';
      default:       return 'directions_car';
    }
  }

  private addTransportIcon(from: any, to: any, category: string, color: string): void {
    const midLat = (from._lat + to._lat) / 2;
    const midLng = (from._lng + to._lng) / 2;
    const iconName = this.getTransportMaterialIcon(category);

    const icon = L.divIcon({
      html: `<div class="transport-icon-marker" style="background-color: ${color}">
               <span class="material-icons">${iconName}</span>
             </div>`,
      className: 'custom-transport-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker([midLat, midLng], { icon, interactive: false, zIndexOffset: -100 })
      .addTo(this.routeLayers);
  }

  public flyToLocation(lat: number, lng: number, zoom: number = 13): void {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.5
      });
      // Optionally add a marker or popup
      L.popup()
        .setLatLng([lat, lng])
        .setContent('Selected Location')
        .openOn(this.map);
    }
  }
}