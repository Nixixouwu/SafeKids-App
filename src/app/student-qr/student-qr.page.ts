import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { arrowBackOutline, downloadOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-student-qr',
  templateUrl: './student-qr.page.html',
  styleUrls: ['./student-qr.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonIcon, RouterModule]
})
export class StudentQrPage implements OnInit {
    // Propiedades para almacenar la información del estudiante, URL del QR, etc.
  studentInfo: any = {};
  qrCodeUrl: string = '';
  defaultImage: string = 'assets/img/avatar-default.png';
  isScanning: boolean = false;
  viajeId: string = '';

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private location: Location
  ) {
    addIcons({arrowBackOutline,checkmarkCircleOutline});
  }

  // Inicializa la página y obtiene los parámetros de la URL (ID del estudiante, si está escaneando, ID del viaje)
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log('Received query params:', params);
      const studentId = params['id'];
      this.isScanning = params['scanning'] === 'true';
      this.viajeId = params['viajeId'];
      
      if (studentId) {
        this.loadStudentInfo(studentId);
      }
    });
  }

  // Carga la información del estudiante desde Firestore usando su ID
  async loadStudentInfo(studentId: string) {
    try {
      console.log('Loading student info for ID:', studentId);
      const studentDoc = await getDoc(doc(this.firestore, `Alumnos/${studentId}`));
      if (studentDoc.exists()) {
        const data = studentDoc.data();
        this.studentInfo = { id: studentDoc.id, ...data };
        
        if (this.studentInfo.RUT) {
          await this.generateQR(studentId);
        } else {
          console.error('RUT no encontrado en los datos del estudiante:', this.studentInfo);
        }
      }
    } catch (error) {
      console.error('Error loading student info:', error);
    }
  }

  // Genera el código QR usando el RUT del estudiante
  async generateQR(studentId: string) {
    try {
      console.log('Student Info in generateQR:', this.studentInfo);
      
      const studentRut = this.studentInfo.RUT;
      if (!studentRut) {
        console.error('RUT del estudiante no encontrado');
        return;
      }

      const studentUrl = `safekids://student/${studentRut}`;
      this.qrCodeUrl = await QRCode.toDataURL(studentUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  }

  // Permite descargar el código QR como imagen PNG
  downloadQR() {
    if (this.qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `student-${this.studentInfo.RUT}-qr.png`;
      link.href = this.qrCodeUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Navega a la página anterior
  goBack() {
    this.location.back();
  }

  // Actualiza el estado del estudiante a "Abordo" en el viaje actual
  async updateStudentStatus(studentRut: string) {
    try {
      const pasajeroRef = doc(this.firestore, `Viaje/${this.viajeId}/Pasajeros/${studentRut}`);
      await updateDoc(pasajeroRef, {
        Abordo: true
      });
      alert('Estudiante confirmado exitosamente');
      this.location.back();
    } catch (error) {
      console.error('Error updating student status:', error);
      alert('Error al confirmar el estudiante');
    }
  }
}
