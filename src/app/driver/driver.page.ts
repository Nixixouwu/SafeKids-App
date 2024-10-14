import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Database, ref, set, get } from '@angular/fire/database';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; // Asegúrate de importar RouterModule

@Component({
  selector: 'app-driver',
  templateUrl: './driver.page.html',
  styleUrls: ['./driver.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule] // Asegúrate de que RouterModule esté incluido aquí
})
export class DriverPage implements OnInit {
  private watchId: string | undefined;
  driverInfo: any = {};
  schoolInfo: any = {};
  driverImageUrl: string = ''; // Asegúrate de que esta línea esté presente

  constructor(
    private db: Database,
    private authService: AuthService,
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

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
        this.driverImageUrl = this.driverInfo.Imagen || this.driverImageUrl; // Actualiza la imagen si existe
        console.log('Información del conductor:', this.driverInfo); // Para depuración
      } else {
        console.error('No se encontró información del conductor para este ID');
      }
    } catch (error) {
      console.error('Error al obtener el documento:', error);
    }
  }

  async loadSchoolInfo(schoolPath: string) {
    const schoolRef = ref(this.db, schoolPath);
    const snapshot = await get(schoolRef);
    if (snapshot.exists()) {
      this.schoolInfo = snapshot.val();
    } else {
      console.error('No school data found');
    }
  }

  async iniciarViaje() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.updateLocationInFirebase(position.coords.latitude, position.coords.longitude);
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
          this.updateLocationInFirebase(position.coords.latitude, position.coords.longitude);
        }
      }
    );
  }

  updateLocationInFirebase(latitude: number, longitude: number) {
    const driverLocationRef = ref(this.db, 'Users/dtdt4t4t3w4t43/Coords');
    set(driverLocationRef, { Latitude: latitude, Longitude: longitude });
  }
}
