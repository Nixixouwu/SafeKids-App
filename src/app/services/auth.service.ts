import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc, collection, query, getDocs, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth;
  private userEmail: string | null = null;
  private userId: string | null = null;

  constructor(private router: Router, private firestore: Firestore) {
    const app = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(app);
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Obtener el userId desde Firestore
      await this.fetchUserId(email);

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

  private async fetchUserId(email: string) {
    const userDocRefApoderado = collection(this.firestore, 'Apoderado');
    const userDocRefConductor = collection(this.firestore, 'Conductor');

    try {
      // Buscar en la colección Apoderado
      const querySnapshotApoderado = await getDocs(query(userDocRefApoderado, where('Email', '==', email)));
      if (!querySnapshotApoderado.empty) {
        querySnapshotApoderado.forEach(doc => {
          this.userId = doc.id; // Obtén el ID del documento
          this.userEmail = email;
          console.log('User ID fetched from Apoderado:', this.userId); // Verifica el ID obtenido
        });
        return; // Salir si se encontró en Apoderado
      } else {
        console.log('No se encontró usuario en Apoderado para el correo:', email);
      }

      // Buscar en la colección Conductor
      const querySnapshotConductor = await getDocs(query(userDocRefConductor, where('Email', '==', email)));
      if (!querySnapshotConductor.empty) {
        querySnapshotConductor.forEach(doc => {
          this.userId = doc.id; // Obtén el ID del documento
          this.userEmail = email;
          console.log('User ID fetched from Conductor:', this.userId); // Verifica el ID obtenido
        });
      } else {
        console.log('No se encontró usuario en Conductor para el correo:', email);
      }
    } catch (error) {
      console.error('Error al buscar el ID del usuario:', error);
    }
  }

  logout(): void {
    // Lógica para cerrar sesión aquí
  }

  setUserEmail(email: string) {
    this.userEmail = email;
    console.log('Correo electrónico establecido:', this.userEmail);
  }

  getUserEmail(): string | null {
    return this.userEmail;
  }

  getUserId(): string | null {
    return this.userId;
  }
}
