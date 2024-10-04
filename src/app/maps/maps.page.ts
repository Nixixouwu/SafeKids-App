import { Component, OnInit, OnDestroy } from '@angular/core';
import { Database, ref, onValue, off } from '@angular/fire/database';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MapsPage implements OnInit, OnDestroy {
  map!: L.Map;
  driverMarker!: L.Marker;
  updateInterval: any;

  constructor(private database: Database) {}

  ngOnInit() {
    this.checkAndReloadIfNeeded();
    this.initMap();
    this.listenToDriverLocation();
  }

  ngOnDestroy() {
    const driverLocationRef = ref(this.database, 'Users/dtdt4t4t3w4t43/Coords');
    off(driverLocationRef);
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

      this.driverMarker = L.marker([latitude, longitude], { icon: customIcon }).addTo(this.map);
    } catch (error) {
      console.error('Error al centrar el mapa en el usuario:', error);
    }
  }

  async waitForDom() {
    return new Promise<void>((resolve) => {
      const checkExist = setInterval(() => {
        const mapElement = document.getElementById('map');
        if (mapElement) {
          clearInterval(checkExist);
          resolve();
        }
      }, 100);
    });
  }

  checkAndReloadIfNeeded() {
    // Aquí puedes implementar la lógica para verificar si es necesario recargar
    // Por ejemplo, verificar el estado de la sesión o la autenticación
  }

  listenToDriverLocation() {
    const driverLocationRef = ref(this.database, 'Users/dtdt4t4t3w4t43/Coords');
    onValue(driverLocationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.updateDriverMarker(data.Latitude, data.Longitude);
      }
    });
  }

  updateDriverMarker(latitude: number, longitude: number) {
    const latLng = L.latLng(latitude, longitude);
    if (!this.driverMarker) {
      this.driverMarker = L.marker(latLng).addTo(this.map);
    } else {
      this.driverMarker.setLatLng(latLng);
    }
    this.map.setView(latLng, 15);
  }

  centerMap() {
    this.centerOnUser(true); // Llama a la función que centra el mapa en la ubicación actual
  }
}