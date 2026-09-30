import { inject } from '@angular/core';
import { CanActivateFn, Routes, Router } from '@angular/router';

const requireAuth: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  if (typeof localStorage !== 'undefined' && localStorage.getItem('authToken')) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

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
    canActivate: [requireAuth],
    loadComponent: () => import('./dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'profile',
    canActivate: [requireAuth],
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'cart',
    canActivate: [requireAuth],
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
    canActivate: [requireAuth],
    loadComponent: () => import('./checkout/checkout.page').then( m => m.CheckoutPage)
  },
   {
    path: 'address',
    canActivate: [requireAuth],
    loadComponent: () => import('./address/address.page').then( m => m.AddressPage)
  },
  {
    path: 'order-history',
    canActivate: [requireAuth],
    loadComponent: () => import('./order-history/order-history.page').then( m => m.OrderHistoryPage)
  },
  {
    path: '**',
    redirectTo: 'login'
  }

];
