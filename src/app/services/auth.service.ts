import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth;
  private userEmail: string | null = null;

  constructor(private router: Router) {
    const app = initializeApp(environment.firebaseConfig); // Asegúrate de que esto esté aquí
    this.auth = getAuth(app);
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Verifica el dominio del correo
      if (user.email?.endsWith('@SafeKids.com')) {
        this.router.navigate(['/driver']);
      } else {
        this.router.navigate(['/home-parents']);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // Manejo de errores (puedes lanzar el error o manejarlo de otra manera)
      throw error;
    }
  }

  // Método de ejemplo para cerrar sesión
  logout(): void {
    // Lógica para cerrar sesión aquí
  }

  setUserEmail(email: string) {
    this.userEmail = email;
  }

  getUserEmail(): string | null {
    return this.userEmail;
  }
}
