import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { bus } from 'ionicons/icons';

@Component({
  selector: 'app-home-parents',
  templateUrl: './home-parents.page.html',
  styleUrls: ['./home-parents.page.scss'],
  standalone: true,
  imports: [IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HomeParentsPage implements OnInit {
  parentImageUrl: string = 'assets/img/avatar-default.png'; // Default image

  constructor() { 
    addIcons({bus});
  }

  ngOnInit() {
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
