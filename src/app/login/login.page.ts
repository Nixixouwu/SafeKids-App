import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonIcon, IonButton, IonItem, IonInput, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosed, key, alertCircleOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonItem, IonButton, IonIcon, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule, IonInput]
})
export class LoginPage implements OnInit {
  correo: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private alertController: AlertController
  ) { 
    addIcons({
      key, 
      lockClosed, 
      eyeOutline, 
      eyeOffOutline
    });
  }

  ngOnInit() {
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async presentErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error de inicio de sesión',
      message: message,
      buttons: ['OK'],
      cssClass: 'custom-alert',
      mode: 'ios'
    });

    await alert.present();
  }

  async onSubmit() {
    try {
      if (!this.correo || !this.password) {
        await this.presentErrorAlert('Por favor, complete todos los campos');
        return;
      }

      await this.authService.login(this.correo, this.password);
      const userId = this.authService.getUserId();
      console.log('User ID:', userId);
      console.log('correo:', this.correo);

      if (!userId) {
        console.error('User ID is null or undefined, cannot navigate.');
        await this.presentErrorAlert('Error al obtener la información del usuario');
        return;
      }

      if (this.correo?.endsWith('@safekids.com')) {
        this.router.navigate(['/driver', userId]);
      } else {
        this.router.navigate(['/home-parents', userId]);
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      await this.presentErrorAlert('Correo o contraseña incorrectos');
    }
  }
}
