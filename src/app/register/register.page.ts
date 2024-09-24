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

  rut: string = '';
  nombreCompleto: string = '';
  instituto: string = '';
  telefono: string = '';
  email: string = '';
  password: string = '';

  onSubmit() {
    // Handle login logic here
    console.log('Register submitted', this.rut, this.nombreCompleto, this.instituto, this.telefono, this.email, this.password);
  }

  constructor() { 
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
  }

  onTelefonoInput(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Update the input value if it has changed
    if (value !== numericValue) {
      input.value = numericValue;
      this.telefono = numericValue;
    }
  }

}
