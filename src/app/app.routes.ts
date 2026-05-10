import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.page').then( m => m.CartPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout.page').then( m => m.CheckoutPage)
  },
   {
    path: 'address',
    loadComponent: () => import('./address/address.page').then( m => m.AddressPage)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
