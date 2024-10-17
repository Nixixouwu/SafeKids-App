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
    path: 'maps',
    loadComponent: () => import('./maps/maps.page').then( m => m.MapsPage)
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

];
