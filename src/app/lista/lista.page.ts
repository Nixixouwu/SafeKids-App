import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Firestore, collection, getDocs, doc, setDoc } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { Plugins } from '@capacitor/core';
const { BarcodeScanner } = Plugins;

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

  async scanQRCode() {
    try {
      if (!BarcodeScanner || !BarcodeScanner['scan']) {
        console.error('BarcodeScanner no está disponible.');
        return;
      }
      
      const result = await BarcodeScanner['scan']();
      if (result.hasContent) {
        console.log('QR Code scanned:', result.content);
        
        // Extraer el ID del alumno de la URL
        const urlParts = result.content.split('/');
        const studentId = urlParts[urlParts.length - 1]; // Suponiendo que el ID es la última parte de la URL

        // Cambiar el booleano a true en la lista
        this.updateStudentStatus(studentId);
      }
    } catch (error) {
      console.error('Error al escanear el QR:', error);
    }
  }

  updateStudentStatus(studentId: string) {
    const student = this.pasajeros.find(p => p.FK_PAAlumno === studentId);
    if (student) {
      student.Abordo = true; // Cambia el booleano a true
      console.log(`Estado del estudiante ${studentId} actualizado a 'Abordo':`, student);
    } else {
      console.error('Estudiante no encontrado:', studentId);
    }
  }
}
