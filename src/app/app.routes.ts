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
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
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
    path: 'verify-email',
    loadComponent: () => import('./verify-email/verify-email.page').then( m => m.VerifyEmailPage)
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
    path: 'order-history',
    loadComponent: () => import('./order-history/order-history.page').then( m => m.OrderHistoryPage)
  },
  {
    path: '**',
    redirectTo: 'login'
  }

];
