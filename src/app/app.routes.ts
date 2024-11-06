import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },  
  
  {
    path: 'maps/:id',
    loadComponent: () => import('./maps/maps.page').then(m => m.MapsPage)
  },
  {
    path: 'home-parents/:id',
    loadComponent: () => import('./home-parents/home-parents.page').then( m => m.HomeParentsPage)
  },
  {
    path: 'student-parents/:id',
    loadComponent: () => import('./student-parents/student-parents.page').then( m => m.StudentParentsPage)
  },
  {
    path: 'driver/:id',
    loadComponent: () => import('./driver/driver.page').then( m => m.DriverPage)
  },
  {
    path: 'lista/:viajeId',
    loadComponent: () => import('./lista/lista.page').then( m => m.ListaPage)
  },
  {
    path: 'recover-password',
    loadComponent: () => import('./recover-password/recover-password.page').then( m => m.RecoverPasswordPage)
  },
  {
    path: 'info-conductor/:id',
    loadComponent: () => import('./info-conductor/info-conductor.page').then( m => m.InfoConductorPage)
  },
  {
    path: 'edit-profile/:id',
    loadComponent: () => import('./edit-profile/edit-profile.page').then(m => m.EditProfilePage)
  },




];
