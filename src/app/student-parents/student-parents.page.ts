import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { arrowBackOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-student-parents',
  templateUrl: './student-parents.page.html',
  styleUrls: ['./student-parents.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonIcon, RouterModule]
})
export class StudentParentsPage implements OnInit {
  studentInfo: any = {}; // Para almacenar la información del estudiante
  defaultImage: string = 'assets/img/avatar-default.png'; // Imagen por defecto

  constructor(private route: ActivatedRoute, private firestore: Firestore, private location: Location) {
    addIcons({arrowBackOutline});
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const studentId = params['id']; // Obtiene el ID del estudiante de la ruta
      this.loadStudentInfo(studentId);
    });
  }

  async loadStudentInfo(studentId: string) {
    const studentDocRef = doc(this.firestore, `Alumnos/${studentId}`);
    
    try {
      const studentDocSnapshot = await getDoc(studentDocRef);
      
      if (studentDocSnapshot.exists()) {
        this.studentInfo = { id: studentDocSnapshot.id, ...studentDocSnapshot.data() };

        // Recuperar información del colegio
        const schoolId = this.studentInfo.FK_ALColegio; // Obtener el ID del colegio
        if (schoolId) {
          const schoolDocRef = doc(this.firestore, `Colegio/${schoolId}`);
          const schoolDocSnapshot = await getDoc(schoolDocRef);
          
          if (schoolDocSnapshot.exists()) {
            this.studentInfo.colegio = { id: schoolDocSnapshot.id, ...schoolDocSnapshot.data() }; // Almacenar información del colegio
          } else {
            console.error('No se encontró información del colegio para este ID',schoolId);
          }
        }
      } else {
        console.error('No se encontró información del estudiante para este ID');
      }
    } catch (error) {
      console.error('Error al obtener la información del estudiante:', error);
    }
  }

  goBack() {
    this.location.back(); // Método para volver a la página anterior
  }
}
