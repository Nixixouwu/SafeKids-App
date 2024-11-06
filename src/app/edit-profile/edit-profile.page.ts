import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonInput, IonItem, IonList } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cameraOutline, lockClosedOutline, keyOutline, checkmarkCircleOutline, saveOutline } from 'ionicons/icons';
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
  userId: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  imageUrl: string = 'assets/img/avatar-default.png';
  parentInfo: any;

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private storage: Storage,
    private route: ActivatedRoute,
    private router: Router
  ) {
    addIcons({arrowBackOutline,cameraOutline,lockClosedOutline,keyOutline,checkmarkCircleOutline,saveOutline});
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.loadParentInfo();
    });
  }

  async loadParentInfo() {
    const parentDocRef = doc(this.firestore, `Apoderado/${this.userId}`);
    const parentDoc = await getDoc(parentDocRef);
    if (parentDoc.exists()) {
      this.parentInfo = { id: parentDoc.id, ...parentDoc.data() };
      this.imageUrl = this.parentInfo.Imagen || this.imageUrl;
    }
  }

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

  async uploadImage(dataUrl: string) {
    try {
      const storageRef = ref(this.storage, `profile-images/${this.userId}`);
      await uploadString(storageRef, dataUrl, 'data_url');
      
      const downloadUrl = await getDownloadURL(storageRef);
      
      const parentDocRef = doc(this.firestore, `Apoderado/${this.userId}`);
      await updateDoc(parentDocRef, {
        Imagen: downloadUrl
      });

      alert('Imagen actualizada exitosamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    }
  }

  goBack() {
    this.router.navigate(['/home-parents', this.userId]);
  }
}
