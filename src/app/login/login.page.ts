import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonIcon, IonButton, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mail, lockClosed } from 'ionicons/icons';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonItem, IonButton, IonIcon, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule]
})
export class LoginPage implements OnInit {
  email: string = '';
  password: string = '';

  onSubmit() {
    // Handle login logic here
    console.log('Login submitted', this.email, this.password);
  }

  constructor() { 
    addIcons({ mail, lockClosed });
  }

  ngOnInit() {
  }

}
