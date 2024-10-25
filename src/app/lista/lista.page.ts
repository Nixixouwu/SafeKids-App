import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.page.html',
  styleUrls: ['./lista.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListaPage implements OnInit {
  pasajeros: any[] = [];
  viajeId: string = '';

  constructor(
    private firestore: Firestore,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) {
    addIcons(allIcons);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.viajeId = params['viajeId'];
      this.loadPasajeros();
    });
  }

  async loadPasajeros() {
    if (!this.viajeId) {
      console.error('El ID del viaje no está definido.');
      return;
    }
    const pasajerosRef = collection(this.firestore, `Viaje/${this.viajeId}/Pasajeros`);
    const querySnapshot = await getDocs(pasajerosRef);
    this.pasajeros = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  goToStudent(studentId: string) {
    this.router.navigate(['/student-parents', studentId]);
  }

  detenerViaje() {
    this.location.back(); // Retrocede a la página anterior
  }
}
