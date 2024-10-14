import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Database, ref, set, get } from '@angular/fire/database';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.page.html',
  styleUrls: ['./driver.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DriverPage implements OnInit {
  private watchId: string | undefined;
  driverInfo: any = {};
  schoolInfo: any = {};

  constructor(
    private db: Database,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDriverInfo();
  }

  async loadDriverInfo() {
    const userEmail = this.authService.getUserEmail();
    console.log('User email:', userEmail);
    if (userEmail) {
      const conductorRef = ref(this.db, 'Conductor');
      const snapshot = await get(conductorRef);
      console.log('Snapshot exists:', snapshot.exists());
      if (snapshot.exists()) {
        const conductores = snapshot.val();
        const conductor = Object.values(conductores).find((c: any) => c.correo === userEmail);
        if (conductor) {
          this.driverInfo = conductor;
          console.log('Driver info:', this.driverInfo);
          await this.loadSchoolInfo(this.driverInfo.FK_COColegio);
        } else {
          console.error('No driver data found for this email');
        }
      } else {
        console.error('No conductors found in the database');
      }
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
