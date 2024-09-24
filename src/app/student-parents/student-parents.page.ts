import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { arrowBackOutline, locationOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-student-parents',
  templateUrl: './student-parents.page.html',
  styleUrls: ['./student-parents.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonIcon, RouterModule]
})
export class StudentParentsPage implements OnInit {

  constructor() { 
    addIcons({arrowBackOutline, locationOutline});
  }

  ngOnInit() {
  }

}
