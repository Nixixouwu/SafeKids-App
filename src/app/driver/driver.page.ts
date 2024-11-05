import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, setDoc, collection, query, getDocs, where } from '@angular/fire/firestore';
import { Geolocation } from '@capacitor/geolocation';
import { ref, set } from 'firebase/database';
import { Database } from '@angular/fire/database';
import { RouterModule } from '@angular/router';
import * as allIcons from 'ionicons/icons';
import { addIcons } from 'ionicons';


@Component({
  selector: 'app-driver',
  templateUrl: './driver.page.html',
  styleUrls: ['./driver.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
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
    private database: Database,
    private router: Router // Asegúrate de inyectar el Router
  ) {
    this.db = database;
    addIcons(allIcons);
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

        // Realiza una consulta para obtener el bus asociado al conductor
        const busesRef = collection(this.firestore, 'Bus');
        const q = query(busesRef, where('FK_BUConductor', '==', this.driverInfo.RUT)); // Suponiendo que el RUT está en driverInfo
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const busData = querySnapshot.docs[0].data(); // Obtiene el primer bus encontrado
          this.busInfo = { id: querySnapshot.docs[0].id, ...busData }; // Almacena la información del bus
          console.log('Información del bus:', this.busInfo); // Para depuración
        } else {
          console.error('No se encontró información del bus para este conductor');
        }

        const schoolId = this.driverInfo.FK_COColegio; // Obtener el ID del colegio
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
      // Verifica si las IDs existen antes de intentar acceder a ellas
      const busId = this.busInfo.ID_Placa;
      const schoolId = this.driverInfo.FK_COColegio;

      if (!busId || !schoolId) {
        console.error('No se puede iniciar el viaje: la ID del bus o del colegio no está definida.');
        return;
      }

      // Carga la información del bus y la escuela
      await this.loadBusInfo(busId);
      await this.loadSchoolInfo(schoolId);

      const position = await Geolocation.getCurrentPosition();
      const viajeId = `${this.driverInfo.id}_${new Date().toISOString()}`; // Genera un ID único
      const viajeRef = doc(this.firestore, `Viaje/${viajeId}`);

      // Verifica que la información del colegio esté definida
      if (!this.schoolInfo.id) {
        console.error('No se puede iniciar el viaje: la ID del colegio no está definida.', this.schoolInfo.id);
        return;
      }

      // Crea el viaje en la base de datos
      await setDoc(viajeRef, {
        FK_VIConductor: this.driverInfo.id,
        FK_VICondNombre: this.driverInfo.Nombre,
        FK_VICondApellido: this.driverInfo.Apellido,
        FK_VIBus: this.busInfo.ID_Placa, // Almacena la ID del bus
        FK_VIColegio: this.schoolInfo.id,
        Terminado: false,  // Almacena la ID del colegio
        inicio: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        }
      });

      console.log('Viaje creado con ID:', viajeId);

      // Obtener alumnos del mismo colegio
      const alumnosRef = collection(this.firestore, 'Alumnos');
      const q = query(alumnosRef, where('FK_ALColegio', '==', schoolId));
      const querySnapshot = await getDocs(q);

      for (const docSnapshot of querySnapshot.docs) {
        const alumnoData = docSnapshot.data(); // Usa data() para obtener los datos
        const pasajero = {
          nombre: alumnoData['Nombre'],
          apellido: alumnoData['Apellido'], // Asegúrate de que 'Apellido' sea el campo correcto
          FK_PAAlumno: docSnapshot.id,
          Abordo: false
        };
        const pasajeroDocRef = doc(this.firestore, `Viaje/${viajeId}/Pasajeros/${docSnapshot.id}`); // Usa el ID del documento
        await setDoc(pasajeroDocRef, pasajero);
      }

      this.startLocationUpdates();
      this.router.navigate(['/lista', viajeId]);
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
