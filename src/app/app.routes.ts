import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
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
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'maps',
    loadComponent: () => import('./maps/maps.page').then( m => m.MapsPage)
  },
  {
    path: 'home-parents',
    loadComponent: () => import('./home-parents/home-parents.page').then( m => m.HomeParentsPage)
  },
  {
    path: 'student-parents',
    loadComponent: () => import('./student-parents/student-parents.page').then( m => m.StudentParentsPage)
  },
  {
    path: 'driver',
    loadComponent: () => import('./driver/driver.page').then( m => m.DriverPage)
  },

];
