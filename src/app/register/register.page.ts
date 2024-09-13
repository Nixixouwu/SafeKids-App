import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonIcon, IonLabel, IonSelect, IonSelectOption, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonIcon, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSelect, IonSelectOption]
})
export class RegisterPage implements OnInit {

  nombreApoderado: string = '';
  nombreAlumno: string = '';
  instituto: string = '';
  telefono: string = '';
  email: string = '';
  password: string = '';

  onSubmit() {
    // Handle login logic here
    console.log('Register submitted', this.nombreApoderado, this.nombreAlumno, this.instituto, this.telefono, this.email, this.password);
  }

  constructor() { }

  ngOnInit() {
  }

}
