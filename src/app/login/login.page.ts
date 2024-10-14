import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonIcon, IonButton, IonItem, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosed, key, exit } from 'ionicons/icons';
import { AuthService } from '../services/auth.service'; // Importa el servicio
import { RouterModule } from '@angular/router'; // Agregar esta línea
import { Router } from '@angular/router'; // Agregar esta línea

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonItem, IonButton, IonIcon, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule, IonInput]
})
export class LoginPage implements OnInit {
  correo: string = ''; // Cambiado de rut a correo
  password: string = '';

  constructor(private authService: AuthService, private router: Router) { 
    addIcons({key, lockClosed});
  }

  ngOnInit() {
  }

  async onSubmit() {
    try {
      await this.authService.login(this.correo, this.password);
      this.authService.setUserEmail(this.correo);
      if (this.correo.endsWith('@safekids.com')) {
        this.router.navigate(['/driver']);
      } else {
        this.router.navigate(['/home-parents']);
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
    }
  }
}
