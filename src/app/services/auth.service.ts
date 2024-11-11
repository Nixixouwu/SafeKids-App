import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc, collection, query, getDocs, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Propiedades privadas para manejar la autenticación
  private auth;
  private userEmail: string | null = null;
  private userId: string | null = null;

  constructor(private router: Router, private firestore: Firestore) {
    const app = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(app);
  }

  // Función para iniciar sesión con email y contraseña
  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Obtener el userId desde Firestore
      await this.fetchUserId(email);

      // Redireccionar según el tipo de usuario (conductor o apoderado)
      if (this.userEmail?.endsWith('@safekids.com')) {
        this.router.navigate(['/driver']);
      } else {
        if (this.userId) {
          this.router.navigate(['/home-parents', this.userId]);
        } else {
          console.error('User ID is null or undefined, cannot navigate to home-parents');
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }

  // Función para enviar correo de restablecimiento de contraseña
  async sendPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      console.log('Correo de restablecimiento enviado a:', email);
    } catch (error) {
      console.error('Error al enviar el correo de restablecimiento:', error);
      throw error;
    }
  }

  // Función privada para obtener el ID del usuario desde Firestore
  private async fetchUserId(email: string) {
    const userDocRefApoderado = collection(this.firestore, 'Apoderado');
    const userDocRefConductor = collection(this.firestore, 'Conductor');

    try {
      // Buscar en la colección Apoderado
      const querySnapshotApoderado = await getDocs(query(userDocRefApoderado, where('Email', '==', email)));
      if (!querySnapshotApoderado.empty) {
        querySnapshotApoderado.forEach(doc => {
          this.userId = doc.id;
          this.userEmail = email;
          console.log('User ID fetched from Apoderado:', this.userId);
        });
        return;
      }

      // Buscar en la colección Conductor si no se encontró en Apoderado
      const querySnapshotConductor = await getDocs(query(userDocRefConductor, where('Email', '==', email)));
      if (!querySnapshotConductor.empty) {
        querySnapshotConductor.forEach(doc => {
          this.userId = doc.id;
          this.userEmail = email;
          console.log('User ID fetched from Conductor:', this.userId);
        });
      }
    } catch (error) {
      console.error('Error al buscar el ID del usuario:', error);
    }
  }

  // Función para cerrar sesión (pendiente de implementar)
  logout(): void {
    // Lógica para cerrar sesión aquí
  }

  // Función para establecer el email del usuario
  setUserEmail(email: string) {
    this.userEmail = email;
    console.log('Correo electrónico establecido:', this.userEmail);
  }

  // Función para obtener el email del usuario
  getUserEmail(): string | null {
    return this.userEmail;
  }

  // Función para obtener el ID del usuario
  getUserId(): string | null {
    return this.userId;
  }

  // Función para actualizar la contraseña del usuario
  async updatePassword(currentPassword: string, newPassword: string) {
    const user = await this.auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    
    try {
      // Re-autenticar usuario antes de cambiar la contraseña
      await reauthenticateWithCredential(user, credential);
      // Actualizar contraseña
      await updatePassword(user, newPassword);
    } catch (error) {
      throw error;
    }
  }
}
