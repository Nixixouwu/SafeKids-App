import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { bus, arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { Firestore, doc, getDoc, collection, query, getDocs, where } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home-parents',
  templateUrl: './home-parents.page.html',
  styleUrls: ['./home-parents.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, RouterModule]
})
export class HomeParentsPage implements OnInit {
  parentImageUrl: string = 'assets/img/avatar-default.png'; // Default image
  parentInfo: any = { estudiantes: [] }; // Inicializa estudiantes como un array vacío

  constructor(private authService: AuthService, private firestore: Firestore, private route: ActivatedRoute) { 
    addIcons({bus, arrowBackOutline});
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['id']; // Obtiene el ID de la ruta
      this.loadParentInfo(userId);
    });
  }

  async loadParentInfo(userId: string) {
    const parentDocRef = doc(this.firestore, `Apoderado/${userId}`);
    
    try {
      const parentDocSnapshot = await getDoc(parentDocRef);
      
      if (parentDocSnapshot.exists()) {
        this.parentInfo = { id: parentDocSnapshot.id, ...parentDocSnapshot.data(), estudiantes: [] }; // Asegúrate de que estudiantes esté inicializado
        this.parentImageUrl = this.parentInfo.image || this.parentImageUrl; // Actualiza la imagen si existe

        // Cargar estudiantes asociados
        await this.loadStudentsByParentId(userId);
        console.log('Información del padre:', this.parentInfo); // Para depuración
      } else {
        console.error('No se encontró información del padre para este ID');
      }
    } catch (error) {
      console.error('Error al obtener la información del padre:', error);
    }
  }

  async loadStudentsByParentId(parentId: string) {
    const studentsRef = collection(this.firestore, 'Alumnos');
    const q = query(studentsRef, where('FK_ALApoderado', '==', parentId)); // Filtra por el ID del apoderado

    try {
      const querySnapshot = await getDocs(q);
      this.parentInfo.estudiantes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Verifica cuántos estudiantes se han cargado
      console.log('Estudiantes cargados:', this.parentInfo.estudiantes.length); // Verifica la cantidad de estudiantes
      console.log('Estudiantes:', this.parentInfo.estudiantes); // Verifica los datos de los estudiantes

      // Si no hay estudiantes, puedes manejarlo aquí
      if (this.parentInfo.estudiantes.length === 0) {
        console.log('No hay estudiantes asociados a este apoderado.');
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    }
  }

  async editImage() {
    console.log('editImage function called');
    try {
      console.log('Attempting to get photo');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      console.log('Photo captured', image);

      if (image.dataUrl) {
        this.parentImageUrl = image.dataUrl;
        console.log('Image URL updated');
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }
}
