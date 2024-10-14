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
      const userId = this.authService.getUserId(); // Obtén el ID almacenado
      console.log('User ID:', userId);
      console.log('cprrep:', this.correo); // Verifica el valor del userId

      if (!userId) {
        console.error('User ID is null or undefined, cannot navigate.');
        return; // Salir si userId es nulo
      }

      if (this.correo?.endsWith('@safekids.com')) {
        this.router.navigate(['/driver', userId]); // Navega a driver con el userId
      } else {
        this.router.navigate(['/home-parents', userId]); // Navega a home-parents con el userId
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
    }
  }
}
