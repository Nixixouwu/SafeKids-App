import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { jsPDF } from 'jspdf';
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
  busInfo: any = {};

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
        console.log('Información del conductor:', this.driverInfo);
        
        const busesRef = collection(this.firestore, 'Bus');
        const q = query(busesRef, where('FK_BUConductor', '==', this.driverInfo.RUT));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const busData = querySnapshot.docs[0].data();
            this.busInfo = { id: querySnapshot.docs[0].id, ...busData };
            console.log('Información del bus:', this.busInfo);
        } else {
            console.error('No se encontró información del bus para este conductor');
        }
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
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Información del Conductor', 10, 10);
    doc.setFontSize(12);
    doc.text(`Nombre: ${this.driverInfo.Nombre} ${this.driverInfo.Apellido}`, 10, 20);
    doc.text(`Fecha de Admision: ${this.driverInfo.Fecha_Admision}`, 10, 30);
    doc.text(`Edad: ${this.driverInfo.Edad} Años`, 10, 40);
    doc.text(`Dirección: ${this.driverInfo.Direccion}`, 10, 50);
    doc.text(`Email: ${this.driverInfo.Email}`, 10, 60);
    doc.text(`Género: ${this.driverInfo.Genero}`, 10, 70);
    doc.text(`RUT: ${this.driverInfo.RUT}`, 10, 80);
    doc.text(`Teléfono: ${this.driverInfo.Telefono}`, 10, 90);

    doc.setFontSize(16);
    doc.text('Información del Bus', 10, 160);
    doc.setFontSize(12);
    doc.text(`Patente: ${this.busInfo.ID_Placa}`, 10, 180);
    doc.text(`Modelo: ${this.busInfo.Modelo}`, 10, 190);
    

    doc.save('informacion_conductor.pdf');
  }
}
