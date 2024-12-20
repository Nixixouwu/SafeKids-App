import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, setDoc, collection, query, getDocs, where, limit } from '@angular/fire/firestore';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { ref, set } from 'firebase/database';
import { Database } from '@angular/fire/database';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  busOutline, 
  arrowBackOutline, 
  locationOutline,
  personCircleOutline 
} from 'ionicons/icons';
import { AlertController } from '@ionic/angular';
import { App } from '@capacitor/app';

declare const cordova: any;

@Component({
  selector: 'app-driver',
  templateUrl: './driver.page.html',
  styleUrls: ['./driver.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class DriverPage implements OnInit, OnDestroy {
  // Propiedades para almacenar la información del conductor, escuela y bus
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
    private router: Router,
    private alertController: AlertController
  ) {
    this.db = database;
    // Inicializa los iconos necesarios
    addIcons({ 
      busOutline, 
      arrowBackOutline, 
      locationOutline,
      personCircleOutline 
    });
  }

  // Función que se ejecuta al iniciar la página
  ngOnInit() {
    this.route.params.subscribe(params => {
      let userId = params['id'];
      
      if (!userId) {
        userId = localStorage.getItem('driverId');
      }
      
      if (userId) {
        localStorage.setItem('driverId', userId);
        this.loadDriverInfo(userId);
      } else {
        console.error('No driver ID found');
        this.router.navigate(['/login']);
      }
    });
  }

  // Función para cargar la información del conductor
  async loadDriverInfo(userId: string) {
    const driverDocRef = doc(this.firestore, `Conductor/${userId}`);
    
    try {
      const driverDocSnapshot = await getDoc(driverDocRef);
      
      if (driverDocSnapshot.exists()) {
        this.driverInfo = { id: driverDocSnapshot.id, ...driverDocSnapshot.data() };
        this.driverImageUrl = this.driverInfo.Imagen || 'assets/img/avatar-default.png';
        console.log('Driver Info loaded:', this.driverInfo);

        // Load bus info
        if (this.driverInfo.RUT) {
          const busesRef = collection(this.firestore, 'Bus');
          const q = query(busesRef, where('FK_BUConductor', '==', this.driverInfo.RUT));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            this.busInfo = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
            console.log('Bus Info:', this.busInfo);
          } else {
            this.busInfo = {};
            console.log('No bus assigned to this driver');
          }
        }

        // Load school info
        if (this.driverInfo.FK_COColegio) {
          await this.loadSchoolInfo(this.driverInfo.FK_COColegio);
        }
      } else {
        console.error('No se encontró información del conductor para este ID');
        localStorage.removeItem('driverId');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error loading driver info:', error);
      this.router.navigate(['/login']);
    }
  }

  // Función para cargar la información del bus
  async loadBusInfo(busId: string) {
    const busDocRef = doc(this.firestore, `Bus/${busId}`);
    
    try {
      const busDocSnapshot = await getDoc(busDocRef);
      
      if (busDocSnapshot.exists()) {
        this.busInfo = { ...busDocSnapshot.data() };
        console.log('Información del bus:', this.busInfo);
      } else {
        console.error('No se encontró información del bus para este ID');
      }
    } catch (error) {
      console.error('Error al obtener el documento del bus:', error);
    }
  }

  // Función para cargar la información de la escuela
  async loadSchoolInfo(schoolId: string) {
    const schoolDocRef = doc(this.firestore, `Colegio/${schoolId}`);
    
    try {
      const schoolDocSnapshot = await getDoc(schoolDocRef);
      
      if (schoolDocSnapshot.exists()) {
        this.schoolInfo = { ...schoolDocSnapshot.data() };
        console.log('Información de la escuela:', this.schoolInfo);
      } else {
        console.error('No se encontró información de la escuela para este ID');
      }
    } catch (error) {
      console.error('Error al obtener el documento de la escuela:', error);
    }
  }

  // Función para mostrar alertas de error
  async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error al iniciar viaje',
      message: message,
      buttons: ['OK'],
      cssClass: 'custom-alert',
      mode: 'ios'
    });

    await alert.present();
  }

  // Función para verificar y solicitar permisos de ubicación
  async checkAndRequestLocation() {
    try {
      // First check if there's an active trip
      const viajesRef = collection(this.firestore, 'Viaje');
      const q = query(
        viajesRef,
        where('FK_VIConductor', '==', this.driverInfo.id),
        where('Terminado', '==', false),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const alert = await this.alertController.create({
          header: 'Viaje en curso',
          message: 'Ya tienes un viaje activo. No puedes iniciar otro viaje hasta terminar el actual.',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'alert-button-cancel'
            },
            {
              text: 'Ver viaje actual',
              handler: () => {
                const viajeActual = querySnapshot.docs[0];
                this.router.navigate(['/lista', viajeActual.id]);
              }
            }
          ],
          cssClass: 'custom-alert',
          mode: 'ios'
        });

        await alert.present();
        return false;
      }

      try {
        await Geolocation.getCurrentPosition();
        return true;
      } catch (error) {
        console.error('Error getting location:', error);
        
        const alert = await this.alertController.create({
          header: 'GPS Desactivado',
          message: 'El GPS está desactivado. Por favor, actívelo para iniciar el viaje.',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'alert-button-cancel'
            },
            {
              text: 'Activar GPS',
              handler: () => {
                if ((window as any).cordova) {
                  cordova.plugins.diagnostic.switchToLocationSettings();
                } else {
                  console.log('Cannot open settings in browser');
                }
              }
            }
          ],
          cssClass: 'custom-alert',
          mode: 'ios'
        });

        await alert.present();
        return false;
      }
    } catch (error) {
      console.error('Error checking location:', error);
      await this.presentErrorAlert('Error al verificar la ubicación');
      return false;
    }
  }

  // Función principal para iniciar un nuevo viaje
  async iniciarViaje() {
    try {
      const locationEnabled = await this.checkAndRequestLocation();
      if (!locationEnabled) {
        return;
      }

      // Verificaciones previas
      if (!this.busInfo.ID_Placa) {
        await this.presentErrorAlert('No hay un bus asignado para iniciar el viaje');
        return;
      }

      if (!this.driverInfo.FK_COColegio) {
        await this.presentErrorAlert('No hay un colegio asignado para iniciar el viaje');
        return;
      }

      // Limpiar watchId existente si hay
      if (this.watchId) {
        Geolocation.clearWatch({ id: this.watchId });
        this.watchId = null;
      }

      const busId = this.busInfo.ID_Placa;
      const schoolId = this.driverInfo.FK_COColegio;

      // Verify IDs
      if (!busId || !schoolId) {
        await this.presentErrorAlert('Faltan datos necesarios para iniciar el viaje');
        return;
      }

      try {
        // Get current position
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
      } catch (locationError) {
        await this.presentErrorAlert('Error al obtener la ubicación. Por favor, verifique que el GPS esté activado');
        return;
      }

    } catch (error) {
      console.error('Error al iniciar el viaje:', error);
      await this.presentErrorAlert('Ocurrió un error al iniciar el viaje. Por favor, inténtelo nuevamente');
    }
  }

  // Función para iniciar el seguimiento de ubicación
  async startLocationUpdates() {
    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 1000 },
      (position) => {
        if (position) {
          this.updateLocationInFirebase(
            this.driverInfo.id, 
            position.coords.latitude, 
            position.coords.longitude
          );
        }
      }
    );
  }

  // Función para actualizar la ubicación en Firebase
  updateLocationInFirebase(driverId: string, latitude: number, longitude: number) {
    const driverLocationRef = ref(this.db, `Users/${driverId}/Coords`);
    set(driverLocationRef, { Latitude: latitude, Longitude: longitude });
  }

  // Función para ver el viaje actual
  async verViajeActual() {
    try {
      const viajesRef = collection(this.firestore, 'Viaje');
      const q = query(
        viajesRef,
        where('FK_VIConductor', '==', this.driverInfo.id),
        where('Terminado', '==', false),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const viajeActual = querySnapshot.docs[0];
        this.router.navigate(['/lista', viajeActual.id]);
      } else {
        // Show alert if no active trip found
        const alert = await this.alertController.create({
          header: 'No hay viaje activo',
          message: 'No se encontró ningún viaje en curso.',
          buttons: ['OK'],
          cssClass: 'custom-alert',
          mode: 'ios'
        });
        await alert.present();
      }
    } catch (error) {
      console.error('Error al buscar viaje actual:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Ocurrió un error al buscar el viaje actual.',
        buttons: ['OK'],
        cssClass: 'custom-alert',
        mode: 'ios'
      });
      await alert.present();
    }
  }

  // Función que se ejecuta al destruir el componente
  ngOnDestroy() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
  }
}