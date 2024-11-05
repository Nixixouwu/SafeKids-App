import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class RecoverPasswordPage {
  nombreCompleto: string = '';
  rut: string = '';
  correo: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router, private authService: AuthService, private alertController: AlertController) {
    addIcons(allIcons);
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.nombreCompleto.trim()) {
      this.errorMessage = 'Debes ingresar tu nombre completo.';
    } else if (!this.rut.trim()) {
      this.errorMessage = 'Debes ingresar tu RUT.';
    } else if (!this.correo.trim()) {
      this.errorMessage = 'Debes ingresar tu correo electrónico.';
    } else if (!this.isValidEmail(this.correo)) {
      this.errorMessage = 'El correo electrónico no es válido.';
    }

    if (this.errorMessage) {
      return; // Detener el envío si hay errores
    }

    // Validar el formato del RUT
    const rutPattern = /^\d{7,8}-[0-9kK]$/; // 7-8 dígitos seguidos de un guion y un dígito verificador
    if (!rutPattern.test(this.rut)) {
      this.errorMessage = 'El RUT no es válido. Debe tener el formato 12345678-9';
      return; // Detener el envío si el RUT no es válido
    }

    try {
      await this.authService.sendPasswordReset(this.correo);
      this.successMessage = 'Se ha enviado un correo de recuperación de contraseña';
      console.log('Correo de restablecimiento enviado a:', this.correo);
      await this.showSuccessAlert();

      // Limpiar los campos
      this.nombreCompleto = '';
      this.rut = '';
      this.correo = '';
      this.successMessage = '';

      this.router.navigate(['/login']); // Redirigir a la página de inicio de sesión
    } catch (error) {
      console.error('Error al enviar el correo de restablecimiento:', error);
      this.errorMessage = 'Error al enviar el correo. Por favor, verifica tu dirección de correo electrónico.';
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'Se ha enviado un correo de recuperación de contraseña',
      buttons: ['OK'],
    });
    await alert.present();
  }

  formatRUT(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos

    // Limitar a 10 dígitos
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // Agregar guion en el penúltimo número si hay más de un dígito
    if (value.length > 1) {
      value = value.slice(0, -1) + '-' + value.slice(-1);
    }

    input.value = value; // Actualizar el valor del input
    this.rut = value; // Actualizar la propiedad del componente
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar el correo electrónico
    return emailPattern.test(email);
  }
}
