import { inject } from '@angular/core';
import { CanActivateFn, Routes, Router } from '@angular/router';
import { MOBILE_ROUTES, MOBILE_ROUTE_SEGMENTS, MOBILE_STORAGE_KEYS } from './constants/app.constants';

const requireAuth: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  if (typeof localStorage !== 'undefined' && localStorage.getItem(MOBILE_STORAGE_KEYS.accessToken)) {
    return true;
  }
  return router.createUrlTree([MOBILE_ROUTES.login], { queryParams: { returnUrl: state.url } });
};

const requireDeliveryPartner: CanActivateFn = () => {
  const router = inject(Router);
  try {
    const user = JSON.parse(localStorage.getItem(MOBILE_STORAGE_KEYS.user) || '{}');
    return localStorage.getItem(MOBILE_STORAGE_KEYS.accessToken) && user.isDeliveryPartner
      ? true
      : router.createUrlTree([MOBILE_ROUTES.dashboard]);
  } catch {
    return router.createUrlTree([MOBILE_ROUTES.dashboard]);
  }
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: MOBILE_ROUTE_SEGMENTS.login,
    pathMatch: 'full',
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.login,
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.forgotPassword,
    loadComponent: () => import('./forgot-password/forgot-password.page').then((module) => module.ForgotPasswordPage)
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.resetPassword,
    loadComponent: () => import('./forgot-password/forgot-password.page').then((module) => module.ForgotPasswordPage)
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.dashboard,
    canActivate: [requireAuth],
    loadComponent: () => import('./dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.profile,
    canActivate: [requireAuth],
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.cart,
    canActivate: [requireAuth],
    loadComponent: () => import('./cart/cart.page').then( m => m.CartPage)
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.register,
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.verifyEmail,
    loadComponent: () => import('./verify-email/verify-email.page').then( m => m.VerifyEmailPage)
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.checkout,
    canActivate: [requireAuth],
    loadComponent: () => import('./checkout/checkout.page').then( m => m.CheckoutPage)
  },
   {
    path: MOBILE_ROUTE_SEGMENTS.address,
    canActivate: [requireAuth],
    loadComponent: () => import('./address/address.page').then( m => m.AddressPage)
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.orderHistory,
    canActivate: [requireAuth],
    loadComponent: () => import('./order-history/order-history.page').then( m => m.OrderHistoryPage)
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.paymentHistory,
    canActivate: [requireAuth],
    loadComponent: () => import('./payment-history/payment-history.page').then((module) => module.PaymentHistoryPage),
  },
  {
    path: MOBILE_ROUTE_SEGMENTS.delivery,
    canActivate: [requireAuth, requireDeliveryPartner],
    loadComponent: () => import('./delivery/delivery.page').then((module) => module.DeliveryPage),
  },
  {
    path: '**',
    redirectTo: MOBILE_ROUTE_SEGMENTS.login
  }

];
