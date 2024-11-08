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
  pasajeros: any[] = [];
  viajeId: string = '';

  constructor(
    private firestore: Firestore,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) {
    addIcons(allIcons);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.viajeId = params['viajeId'];
      this.loadPasajeros();
    });
  }

  async loadPasajeros() {
    if (!this.viajeId) {
      console.error('El ID del viaje no está definido.');
      return;
    }
    const pasajerosRef = collection(this.firestore, `Viaje/${this.viajeId}/Pasajeros`);
    const querySnapshot = await getDocs(pasajerosRef);
    this.pasajeros = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  goToStudent(studentId: string) {
    this.router.navigate(['/student-parents', studentId]);
  }

  detenerViaje() {
    const viajeRef = doc(this.firestore, `Viaje/${this.viajeId}`);
    setDoc(viajeRef, { Terminado: true }, { merge: true }); // Cambia el estado a true
    this.location.back(); // Retrocede a la página anterior
  }

  async updateStudentStatus(studentRut: string) {
    try {
      // Find the passenger document in the current trip
      const pasajeroRef = doc(this.firestore, `Viaje/${this.viajeId}/Pasajeros/${studentRut}`);
      
      // Update Abordo to true
      await updateDoc(pasajeroRef, {
        Abordo: true
      });

      console.log(`Estado del estudiante ${studentRut} actualizado a 'Abordo': true`);
    } catch (error) {
      console.error('Error updating student status:', error);
      throw error; // Propagate error to handle it in the scanning function
    }
  }

  async scanStudentQR() {
    try {
      // Check if scanner is supported
      const { supported } = await BarcodeScanner.isSupported();
      if (!supported) {
        alert('El escáner de códigos QR no está soportado en este dispositivo');
        return;
      }

      // Check and install Google Barcode Scanner Module if needed
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) {
        alert('Instalando el módulo de escaneo QR...');
        await BarcodeScanner.installGoogleBarcodeScannerModule();
        alert('Módulo QR instalado correctamente, por favor, inténtelo de nuevo');
        return;
      }

      // Request camera permission
      await BarcodeScanner.requestPermissions();
      
      // Start scanning
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
      
      // Type guard to check if error is an object with message property
      if (err && typeof err === 'object' && 'message' in err) {
        const error = err as { message: string };
        
        // Check if the error is due to user cancellation
        if (error.message.includes('User cancelled')) {
          // Don't show any message when user cancels
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

  // Optional: Stop scanning when leaving the page
  ionViewWillLeave() {
    BarcodeScanner.stopScan();
  }

  private async addStudentToTrip(studentId: string, studentData: any) {
    // Your existing logic to add student to trip
    // This would update the lista/trip data in your database
  }
}
