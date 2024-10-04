import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Database, ref, set } from '@angular/fire/database';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-driver',
  template: `
    <ion-content>
      <ion-button (click)="iniciarViaje()">Iniciar Viaje</ion-button>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule]
})
export class DriverPage implements OnInit {
  private watchId: string | undefined;

  constructor(private db: Database) {}

  ngOnInit() {}

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