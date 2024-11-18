import { isPlatformBrowser } from '@angular/common';
import { Component } from '@angular/core';
import {  Inject, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-gps',
  templateUrl: './gps.component.html',
  styleUrl: './gps.component.scss'
})
export class GpsComponent implements OnInit {
  private map: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private async initMap(): Promise<void> {
    const L = await import('leaflet'); // Dynamically import Leaflet

    this.map = L.map('map', {
      center: [13.0827,80.2707],
      zoom: 10
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'assets/image.png',  // Path to your custom icon
      iconSize: [32, 32], // Size of the icon (width, height)
      iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
      popupAnchor: [0, -32]  // Point from which the popup should open relative to the iconAnchor
    });
    
    const markerA = L.marker([12.9749, 80.1328]).addTo(this.map);
    const markerB = L.marker([11.9416, 79.8083]).addTo(this.map); 
    const markerC = L.marker([12.9716, 77.5946]).addTo(this.map);

    // const resturant = L.marker([12.976846147173212, 80.13216912582288], { icon: customIcon }).addTo(this.map);
    markerA.bindPopup('<b>Start Poin At</b>').openPopup();
    markerB.bindPopup('<b>End Point b</b>').openPopup();
    markerC.bindPopup('<b>End Point c</b>').openPopup();

    // resturant.bindPopup('<p>Yaa Mohideen<p>').openPopup();  
    // resturant.on('click', () => {
    //   console.log('evnet map seletced');
      
    // })
    // Call the OSRM API to get the route between point A and point B 12.9749° N, 80.1328
    await this.getRoute([12.9716, 77.5946],[12.9749, 80.1328], [11.9416, 79.8083]);
  }

  private async getRoute(pointA: [number, number], pointB: [number, number],pointC: [number, number]): Promise<void> {
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${pointA[1]},${pointA[0]};${pointB[1]},${pointB[0]};${pointC[1]},${pointC[0]}?geometries=geojson&alternatives=true`);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

        // Draw the route on the map
        const L = await import('leaflet'); // Ensure Leaflet is imported again
        const route = L.polyline(coordinates, { color: 'blue' }).addTo(this.map);

        // Zoom the map to fit the route
        this.map.fitBounds(route.getBounds());
      } else {
        console.error('No route found');
      }
    } catch (error) {
      console.error('Error fetching the route:', error);
    }
  }
}
