import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { bus, arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { Firestore, doc, getDoc, collection, query, getDocs, where, onSnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

interface Viaje {
  id: string;
  FK_VIBus: string;
  FK_VICondApellido: string;
  FK_VICondNombre: string;
  conductor: string;
  Terminado: boolean;
  FK_VIConductor: string;
}

@Component({
  selector: 'app-home-parents',
  templateUrl: './home-parents.page.html',
  styleUrls: ['./home-parents.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, RouterModule]
})
export class HomeParentsPage implements OnInit {
  parentImageUrl: string = 'assets/img/avatar-default.png';
  parentInfo: any = { estudiantes: [] };

  constructor(private authService: AuthService, private firestore: Firestore, private route: ActivatedRoute, private router: Router) { 
    addIcons({bus, arrowBackOutline});
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      this.loadParentInfo(userId);
    });
  }

  async loadParentInfo(userId: string) {
    const parentDocRef = doc(this.firestore, `Apoderado/${userId}`);
    
    try {
      const parentDocSnapshot = await getDoc(parentDocRef);
      
      if (parentDocSnapshot.exists()) {
        this.parentInfo = { id: parentDocSnapshot.id, ...parentDocSnapshot.data(), estudiantes: [] };
        this.parentImageUrl = this.parentInfo.image || this.parentImageUrl;

        // Cargar estudiantes asociados
        await this.loadStudentsByParentId(userId);
        this.subscribeToViajes(); // Suscribirse a los cambios en los viajes
        console.log('Información del padre:', this.parentInfo);
      } else {
        console.error('No se encontró información del padre para este ID');
      }
    } catch (error) {
      console.error('Error al obtener la información del padre:', error);
    }
  }

  async loadStudentsByParentId(parentId: string) {
    const studentsRef = collection(this.firestore, 'Alumnos');
    const q = query(studentsRef, where('FK_ALApoderado', '==', parentId));

    try {
      const querySnapshot = await getDocs(q);
      this.parentInfo.estudiantes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        viajes: [] as Viaje[]
      }));

      // Cargar información de los viajes para cada estudiante
      for (const student of this.parentInfo.estudiantes) {
        await this.loadViajesForStudent(student);
      }

      console.log('Estudiantes cargados:', this.parentInfo.estudiantes);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    }
  }

  async loadViajesForStudent(student: any) {
    const viajesRef = collection(this.firestore, `Viaje`);
    const viajesSnapshot = await getDocs(viajesRef);

    for (const viajeDoc of viajesSnapshot.docs) {
      const viajeId = viajeDoc.id;
      const pasajerosRef = collection(this.firestore, `Viaje/${viajeId}/Pasajeros`);
      const pasajerosSnapshot = await getDocs(pasajerosRef);

      const isStudentOnTrip = pasajerosSnapshot.docs.some(pasajero => pasajero.id === student.id);

      if (isStudentOnTrip) {
        const viajeData = { id: viajeId, ...viajeDoc.data() } as Viaje;

        if (!viajeData.Terminado) {

          student.viajes.push(viajeData);
        }
        break; // Salir después de encontrar el primer viaje no terminado
      }
    }
  }

  subscribeToViajes() {
    const viajesRef = collection(this.firestore, 'Viaje');
    onSnapshot(viajesRef, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          // Aquí puedes manejar la lógica para agregar el viaje a los estudiantes
          this.updateViajesForStudents(change.doc);
        }
      });
    });
  }

  async updateViajesForStudents(viajeDoc: any) {
    const viajeData = { id: viajeDoc.id, ...viajeDoc.data() } as Viaje;

    for (const student of this.parentInfo.estudiantes) {
      const pasajerosRef = collection(this.firestore, `Viaje/${viajeData.id}/Pasajeros`);
      const pasajerosSnapshot = await getDocs(pasajerosRef);

      const isStudentOnTrip = pasajerosSnapshot.docs.some(pasajero => pasajero.id === student.id);

      if (isStudentOnTrip && !viajeData.Terminado) {
        student.viajes.push(viajeData);
      }
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

  irAMapa(conductorId: string) {
    this.router.navigate(['/maps', conductorId]); // Redirige a la página de mapas con la ID del conductor
  }
}
