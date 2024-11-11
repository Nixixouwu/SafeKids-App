import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Firestore, collection, getDocs, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListaPage implements OnInit {
  // Propiedades para almacenar la lista de pasajeros y el ID del viaje
  pasajeros: any[] = [];
  viajeId: string = '';

  constructor(
    private firestore: Firestore,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) {
    // Inicializa todos los iconos disponibles
    addIcons(allIcons);
  }

  // Función que se ejecuta al iniciar la página
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.viajeId = params['viajeId'];
      this.loadPasajeros();
    });
  }

  // Función para cargar la lista de pasajeros del viaje actual
  async loadPasajeros() {
    if (!this.viajeId) {
      console.error('El ID del viaje no está definido.');
      return;
    }
    const pasajerosRef = collection(this.firestore, `Viaje/${this.viajeId}/Pasajeros`);
    const querySnapshot = await getDocs(pasajerosRef);
    this.pasajeros = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Función para navegar a la página de detalles del estudiante
  goToStudent(studentId: string) {
    this.router.navigate(['/student-parents', studentId]);
  }

  // Función para finalizar el viaje actual
  detenerViaje() {
    const viajeRef = doc(this.firestore, `Viaje/${this.viajeId}`);
    setDoc(viajeRef, { Terminado: true }, { merge: true });
    this.location.back();
  }

  // Función para actualizar el estado de abordaje del estudiante
  async updateStudentStatus(studentRut: string) {
    try {
      const pasajeroRef = doc(this.firestore, `Viaje/${this.viajeId}/Pasajeros/${studentRut}`);
      await updateDoc(pasajeroRef, {
        Abordo: true
      });
      console.log(`Estado del estudiante ${studentRut} actualizado a 'Abordo': true`);
    } catch (error) {
      console.error('Error updating student status:', error);
      throw error;
    }
  }

  // Función para escanear el código QR del estudiante
  async scanStudentQR() {
    try {
      // Verifica si el escáner es compatible
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) {
        alert('El escáner de códigos QR no está soportado en este dispositivo');
        return;
      }

      // Verifica e instala el módulo de Google Barcode Scanner si es necesario
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) {
        alert('Instalando el módulo de escaneo QR...');
        await BarcodeScanner.installGoogleBarcodeScannerModule();
        alert('Módulo QR instalado correctamente, por favor, inténtelo de nuevo');
        return;
      }

      // Solicita permisos de cámara
      await BarcodeScanner.requestPermissions();
      
      // Inicia el escaneo
      const result = await BarcodeScanner.scan();
      
      if (result.barcodes.length > 0) {
        const scannedUrl = result.barcodes[0].rawValue;
        const studentRut = scannedUrl.split('/').pop();
        
        if (studentRut) {
          this.router.navigate(['/student-qr'], {
            queryParams: {
              id: studentRut,
              scanning: 'true',
              viajeId: this.viajeId
            }
          });
        }
      }
    } catch (err: unknown) {
      console.error('Error scanning QR:', err);
      
      if (err && typeof err === 'object' && 'message' in err) {
        const error = err as { message: string };
        
        if (error.message.includes('User cancelled')) {
          return;
        } else if (error.message.includes('installation')) {
          alert('Error en la instalación del módulo QR. Por favor, inténtelo de nuevo');
        } else if (error.message.includes('permission')) {
          alert('Se necesitan permisos de cámara para escanear');
        } else {
          alert('Error al escanear el código QR');
        }
      }
    }
  }

  // Función que se ejecuta al salir de la página para detener el escaneo
  ionViewWillLeave() {
    BarcodeScanner.stopScan();
  }

  // Función privada para agregar un estudiante al viaje (pendiente de implementar)
  private async addStudentToTrip(studentId: string, studentData: any) {
    // Lógica para agregar estudiante al viaje
  }
}
