import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonIcon, IonLabel, IonSelect, IonSelectOption, IonButton } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonIcon, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSelect, IonSelectOption, RouterModule]
})
export class RegisterPage implements OnInit {

  // Propiedades para almacenar los datos del formulario de registro
  rut: string = '';
  nombreCompleto: string = '';
  instituto: string = '';
  telefono: string = '';
  email: string = '';
  password: string = '';

  // Función que maneja el envío del formulario de registro
  onSubmit() {
    // Lógica para manejar el registro aquí
    console.log('Register submitted', this.rut, this.nombreCompleto, this.instituto, this.telefono, this.email, this.password);
  }

  constructor() { 
    // Inicializa los iconos necesarios para la página
    addIcons({ arrowBackOutline });
  }

  // Función del ciclo de vida que se ejecuta al iniciar la página
  ngOnInit() {
  }

  // Función que valida y formatea la entrada del número de teléfono
  // Solo permite números y elimina cualquier otro carácter
  onTelefonoInput(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Elimina cualquier carácter que no sea número
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Actualiza el valor del input si ha cambiado
    if (value !== numericValue) {
      input.value = numericValue;
      this.telefono = numericValue;
    }
  }

}
