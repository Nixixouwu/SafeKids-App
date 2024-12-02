import { Component, OnInit, OnDestroy } from '@angular/core';
import { Database } from '@angular/fire/database';
import { Firestore, doc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ref, off, DataSnapshot, onValue } from '@angular/fire/database';
import * as allIcons from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class MapsPage implements OnInit, OnDestroy {
  // Propiedades para el mapa y marcadores
  map!: L.Map;
  driverMarker!: L.Marker;
  driverInfo: any = {};
  studentInfo: any = {};
  vehiclePlate: string = '';
  updateInterval: any;
  driverId: string = '';
  customBusIcon = L.icon({
    iconUrl: 'assets/icon/bus.png',
    iconSize: [60, 82],
    iconAnchor: [30, 82],
    popupAnchor: [0, -82]
  });

  constructor(private database: Database, private firestore: Firestore, private route: ActivatedRoute, private location: Location) {
    addIcons(allIcons);
  }

  // Función que se ejecuta al iniciar la página
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.driverId = params['id'];
      this.loadDriverInfo(this.driverId);
      this.loadViajeInfo(this.driverId);
    });
    this.initMap();
    this.listenToDriverLocation();
  }

  // Función para cargar la información del conductor desde Firestore
  async loadDriverInfo(driverId: string) {
    const driverDocRef = doc(this.firestore, `Conductor/${driverId}`);
    try {
      const driverDocSnapshot = await getDoc(driverDocRef);
      if (driverDocSnapshot.exists()) {
        const driverData = driverDocSnapshot.data();
        this.driverInfo = {
          id: driverDocSnapshot.id,
          Nombre: driverData['Nombre'],
          Apellido: driverData['Apellido'],
          Imagen: driverData['Imagen']
        };
      } else {
        console.error('No se encontró información del conductor para este ID');
      }
    } catch (error) {
      console.error('Error al cargar la información del conductor:', error);
    }
  }

  // Función para cargar la información del viaje actual
  async loadViajeInfo(viajeId: string) {
    const viajeDocRef = doc(this.firestore, `Viaje/${viajeId}`);
    try {
      const viajeDocSnapshot = await getDoc(viajeDocRef);
      if (viajeDocSnapshot.exists()) {
        const viajeData = viajeDocSnapshot.data();
        console.log('Datos del viaje:', viajeData);
        this.vehiclePlate = viajeData['FK_VIBus'];
        await this.loadStudentInfo(viajeId);
      } else {
        console.error('No se encontró el viaje con ID:', viajeId);
      }
    } catch (error) {
      console.error('Error al cargar la información del viaje:', error);
    }
  }

  // Función para cargar la información de los estudiantes en el viaje
  async loadStudentInfo(viajeId: string) {
    const pasajerosRef = collection(this.firestore, `Viaje/${viajeId}/Pasajeros`);
    const querySnapshot = await getDocs(pasajerosRef);
    
    if (!querySnapshot.empty) {
        const estudiantes: any[] = [];
        
        for (const pasajeroDoc of querySnapshot.docs) {
            const pasajeroData = pasajeroDoc.data();
            estudiantes.push({
                id: pasajeroDoc.id,
                nombre: pasajeroData['nombre'],
                apellido: pasajeroData['apellido']
            });
        }

        // Asumiendo que solo quieres mostrar el primer estudiante
        if (estudiantes.length > 0) {
            this.studentInfo = estudiantes[0]; // Muestra el primer estudiante
        }
    } else {
        console.error('No se encontraron pasajeros para el viaje:', viajeId);
    }
  }

  // Función que se ejecuta al destruir el componente
  ngOnDestroy() {
    const driverLocationRef = ref(this.database, `Users/${this.driverId}/Coords`);
    off(driverLocationRef);
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  // Función para inicializar el mapa
  async initMap() {
    await this.waitForDom();
    this.map = L.map('map').fitWorld();
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    await this.initializeUserLocation();
  }

  // Función para centrar el mapa en el conductor
  centerMap() {
    // Si tenemos un marcador del conductor, centramos en su posición
    if (this.driverMarker) {
      const driverPosition = this.driverMarker.getLatLng();
      this.map.setView(driverPosition, 15);
    }
  }

  // Función para inicializar la ubicación
  async initializeUserLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;

      if (!this.driverMarker) {
        this.driverMarker = L.marker([latitude, longitude], { 
          icon: this.customBusIcon 
        }).addTo(this.map);
      }
      
      this.map.setView([latitude, longitude], 13);
    } catch (error) {
      console.error('Error al obtener la ubicación inicial:', error);
    }
  }

  // Función para esperar a que el DOM esté listo
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

  // Función para escuchar la ubicación del conductor en tiempo real
  listenToDriverLocation() {
    const driverLocationRef = ref(this.database, `Users/${this.driverId}/Coords`);
    onValue(driverLocationRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        this.updateDriverMarker(data.Latitude, data.Longitude);
      }
    });
  }

  // Función para actualizar el marcador del conductor
  updateDriverMarker(latitude: number, longitude: number) {
    const latLng = L.latLng(latitude, longitude);
    if (!this.driverMarker) {
      this.driverMarker = L.marker(latLng, { 
        icon: this.customBusIcon 
      }).addTo(this.map);
    } else {
      this.driverMarker.setLatLng(latLng);
    }
    this.map.setView(latLng, 15);
  }

  // Función para volver a la página anterior
  goBack() {
    this.location.back();
  }
}