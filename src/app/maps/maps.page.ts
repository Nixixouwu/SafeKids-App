import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MapsPage implements OnInit, OnDestroy {

  map!: L.Map;
  marker!: L.Marker;
  updateInterval: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkAndReloadIfNeeded();
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  async initMap() {
    await this.waitForDom();
    this.map = L.map('map').fitWorld();
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    await this.centerOnUser(true);
    this.startLocationUpdates();
  }

  async centerOnUser(centerMap: boolean = false) {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;

      if (centerMap) {
        this.map.setView([latitude, longitude], 13);
      }

      const customIcon = L.icon({
        iconUrl: 'assets/icon/bus.png',
        iconSize: [60, 82],
        iconAnchor: [30, 82],
        popupAnchor: [0, -82]
      });

      if (this.marker) {
        this.marker.setLatLng([latitude, longitude]);
      } else {
        this.marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(this.map);
      }
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  }

  startLocationUpdates() {
    this.updateInterval = setInterval(() => {
      this.centerOnUser(false);
    }, 5000); // 5000 ms = 5 segundos
  }

  // Nuevo método para centrar el mapa
  centerMap() {
    this.centerOnUser(true);
  }

  private waitForDom(): Promise<void> {
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve());
      }
    });
  }

  private checkAndReloadIfNeeded() {
    const hasReloaded = localStorage.getItem('mapReloaded');
    if (!hasReloaded) {
      localStorage.setItem('mapReloaded', 'true');
      window.location.reload();
    } else {
      localStorage.removeItem('mapReloaded');
      this.initMap();
    }
  }
}