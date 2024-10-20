import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Geolocation } from '@capacitor/geolocation';
import { ref, set } from 'firebase/database';
import { Database } from '@angular/fire/database';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.page.html',
  styleUrls: ['./driver.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DriverPage implements OnInit {
  driverInfo: any = {};
  schoolInfo: any = {};
  busInfo: any = {};
  driverImageUrl: string = '';
  watchId: any;
  private db: any;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private database: Database
  ) {
    this.db = database;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['id']; // Obtiene el ID de la ruta
      this.loadDriverInfo(userId);
    });
  }

  async loadDriverInfo(userId: string) {
    const driverDocRef = doc(this.firestore, `Conductor/${userId}`);
    
    try {
      const driverDocSnapshot = await getDoc(driverDocRef);
      
      if (driverDocSnapshot.exists()) {
        this.driverInfo = { id: driverDocSnapshot.id, ...driverDocSnapshot.data() };
        this.driverImageUrl = this.driverInfo.Imagen || this.driverImageUrl;

        // Verifica si las IDs existen antes de intentar acceder a ellas
        const busId = this.driverInfo.FK_COBus; // Ahora solo es la ID
        if (busId) {
          await this.loadBusInfo(busId);
        } else {
          console.error('FK_COBus no está definido');
        }

        const schoolId = this.driverInfo.FK_COColegio; // Ahora solo es la ID
        if (schoolId) {
          await this.loadSchoolInfo(schoolId);
        } else {
          console.error('FK_COColegio no está definido');
        }
      } else {
        console.error('No se encontró información del conductor para este ID');
      }
    } catch (error) {
      console.error('Error al obtener el documento:', error);
    }
  }

  async loadBusInfo(busId: string) {
    const busDocRef = doc(this.firestore, `Bus/${busId}`);
    
    try {
      const busDocSnapshot = await getDoc(busDocRef);
      
      if (busDocSnapshot.exists()) {
        this.busInfo = { ...busDocSnapshot.data() };
        console.log('Información del bus:', this.busInfo); // Para depuración
      } else {
        console.error('No se encontró información del bus para este ID');
      }
    } catch (error) {
      console.error('Error al obtener el documento del bus:', error);
    }
  }

  async loadSchoolInfo(schoolId: string) {
    const schoolDocRef = doc(this.firestore, `Colegio/${schoolId}`);
    
    try {
      const schoolDocSnapshot = await getDoc(schoolDocRef);
      
      if (schoolDocSnapshot.exists()) {
        this.schoolInfo = { ...schoolDocSnapshot.data() };
        console.log('Información de la escuela:', this.schoolInfo); // Para depuración
      } else {
        console.error('No se encontró información de la escuela para este ID');
      }
    } catch (error) {
      console.error('Error al obtener el documento de la escuela:', error);
    }
  }

  async iniciarViaje() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.updateLocationInFirebase(this.driverInfo.id, position.coords.latitude, position.coords.longitude); // Se agregó el ID del conductor
      this.startLocationUpdates();
    } catch (e) {
      console.error('Error al iniciar el viaje', e);
    }
  }

  async startLocationUpdates() {
    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 1000 },
      (position) => {
        if (position) {
          this.updateLocationInFirebase(this.driverInfo.id, position.coords.latitude, position.coords.longitude); // Se agregó el ID del conductor
        }
      }
    );
  }

  updateLocationInFirebase(driverId: string, latitude: number, longitude: number) {
    const driverLocationRef = ref(this.db, `Users/${driverId}/Coords`); // Usa el ID del conductor
    set(driverLocationRef, { Latitude: latitude, Longitude: longitude });
  }
}
