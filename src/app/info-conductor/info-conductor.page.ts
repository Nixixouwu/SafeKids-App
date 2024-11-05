import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-info-conductor',
  templateUrl: './info-conductor.page.html',
  styleUrls: ['./info-conductor.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class InfoConductorPage implements OnInit {
  driverInfo: any = {};

  constructor(private route: ActivatedRoute, private firestore: Firestore) {}

  ngOnInit() {
    const driverId = this.route.snapshot.paramMap.get('id') || '';
    this.loadDriverInfo(driverId);
  }

  async loadDriverInfo(driverId: string) {
    const driverDocRef = doc(this.firestore, `Conductor/${driverId}`);
    const driverDocSnapshot = await getDoc(driverDocRef);
    
    if (driverDocSnapshot.exists()) {
      this.driverInfo = { id: driverDocSnapshot.id, ...driverDocSnapshot.data() };
    } else {
      console.error('No se encontró información del conductor para este ID');
    }
  }

  openWhatsApp(telefono: string) {
    const url = `https://wa.me/${telefono}`;
    window.open(url, '_blank');
  }

  goBack() {
    window.history.back();
  }

  downloadAntecedentes() {
    // Implementar la lógica para descargar antecedentes
    console.log('Descargando antecedentes...');
  }
}
