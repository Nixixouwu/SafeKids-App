import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonInput, IonItem, IonList } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  cameraOutline, 
  lockClosedOutline, 
  keyOutline, 
  checkmarkCircleOutline, 
  saveOutline,
  eyeOutline,
  eyeOffOutline 
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton, 
    IonIcon, 
    IonInput, 
    IonItem,
    IonList,
    RouterModule
  ]
})
export class EditProfilePage implements OnInit {
  // Propiedades para almacenar la información del usuario y estados de la página
  userId: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  imageUrl: string = 'assets/img/avatar-default.png';
  userInfo: any;
  userType: 'Conductor' | 'Apoderado' = 'Apoderado'; // Por defecto es Apoderado
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private storage: Storage,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Inicializa los iconos necesarios para la página
    addIcons({
      arrowBackOutline,
      cameraOutline,
      lockClosedOutline,
      keyOutline,
      checkmarkCircleOutline,
      saveOutline,
      eyeOutline,
      eyeOffOutline
    });
  }

  // Función que se ejecuta al iniciar la página
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      // Primero intenta cargar como Conductor
      this.loadUserInfo('Conductor').then(exists => {
        if (!exists) {
          // Si no se encuentra como Conductor, intenta como Apoderado
          this.userType = 'Apoderado';
          this.loadUserInfo('Apoderado');
        }
      });
    });
  }

  // Función para cargar la información del usuario desde Firestore
  async loadUserInfo(collection: 'Conductor' | 'Apoderado'): Promise<boolean> {
    const userDocRef = doc(this.firestore, `${collection}/${this.userId}`);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        this.userInfo = { id: userDoc.id, ...userDoc.data() };
        this.imageUrl = this.userInfo.Imagen || this.imageUrl;
        this.userType = collection;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading user info:', error);
      return false;
    }
  }

  // Función para actualizar la contraseña del usuario
  async updatePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      await this.authService.updatePassword(this.currentPassword, this.newPassword);
      alert('Contraseña actualizada exitosamente');
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (error: any) {
      alert('Error al actualizar la contraseña: ' + error.message);
    }
  }

  // Función para seleccionar una nueva imagen de perfil
  async selectImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      if (image.dataUrl) {
        this.imageUrl = image.dataUrl;
        await this.uploadImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }

  // Función para subir la imagen seleccionada a Firebase Storage
  async uploadImage(dataUrl: string) {
    try {
      // Crea una referencia a la carpeta correcta según el tipo de usuario
      const folder = this.userType === 'Apoderado' ? 'apoderados' : 'conductores';
      const storageRef = ref(this.storage, `${folder}/${this.userId}/${new Date().getTime()}_${Math.random().toString(36).substring(7)}.jpg`);
      
      await uploadString(storageRef, dataUrl, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);
      
      const userDocRef = doc(this.firestore, `${this.userType}/${this.userId}`);
      await updateDoc(userDocRef, {
        Imagen: downloadUrl
      });

      alert('Imagen actualizada exitosamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    }
  }

  // Función para volver a la página anterior
  goBack() {
    const route = this.userType === 'Conductor' ? '/driver' : '/home-parents';
    this.router.navigate([route, this.userId]);
  }

  // Funciones para mostrar/ocultar contraseñas
  toggleCurrentPassword() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPassword() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
