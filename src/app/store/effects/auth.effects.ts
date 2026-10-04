import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { ApiService } from '../../services/api-service/api-service';
import * as AuthActions from '../actions/auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    exhaustMap(({ credentials, returnUrl }) => this.api.postData('auth/login', credentials).pipe(
      map((response: any) => response?.success && response.token && response.user
        ? AuthActions.loginSuccess({
            token: response.token,
            refreshToken: response.refreshToken,
            user: response.user,
            returnUrl,
          })
        : AuthActions.loginFailure({ error: response?.message || 'Login failed.' })),
      catchError((error) => of(AuthActions.loginFailure({
        error: error?.error?.message || 'Unable to sign in. Please try again.',
      }))),
    )),
  ));

  persistLogin$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(({ token, refreshToken, user, returnUrl }) => {
      localStorage.setItem('authToken', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      const destination = returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
        ? returnUrl
        : user.isDeliveryPartner ? '/delivery' : '/dashboard';
      void this.router.navigateByUrl(destination, { replaceUrl: true });
    }),
  ), { dispatch: false });

  register$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.register),
    exhaustMap(({ user }) => this.api.postData('auth/register', user).pipe(
      map((response: any) => response?.success
        ? AuthActions.registerSuccess({ email: user.email, verificationCode: response.verificationCode })
        : AuthActions.registerFailure({ error: response?.message || 'Registration failed.' })),
      catchError((error) => of(AuthActions.registerFailure({
        error: error?.error?.message || 'Unable to create your account. Please try again.',
      }))),
    )),
  ));

  verifyOtp$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.verifyOtp),
    exhaustMap(({ email, otp }) => this.api.postData('auth/verify-otp', { email, otp }).pipe(
      map((response: any) => response?.success
        ? AuthActions.verifyOtpSuccess()
        : AuthActions.verifyOtpFailure({ error: response?.message || 'Email verification failed.' })),
      catchError((error) => of(AuthActions.verifyOtpFailure({
        error: error?.error?.message || 'Unable to verify your email. Please try again.',
      }))),
    )),
  ));

  resendOtp$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.resendOtp),
    exhaustMap(({ email }) => this.api.postData('auth/send-otp', { email }).pipe(
      map((response: any) => response?.success
        ? AuthActions.resendOtpSuccess({ verificationCode: response.verificationCode })
        : AuthActions.resendOtpFailure({ error: response?.message || 'Unable to resend the code.' })),
      catchError((error) => of(AuthActions.resendOtpFailure({
        error: error?.error?.message || 'Unable to resend the code. Please try again.',
      }))),
    )),
  ));

  requestPasswordReset$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.requestPasswordReset),
    exhaustMap(({ email }) => this.api.postData('auth/forgot-password', { email }).pipe(
      map((response: any) => AuthActions.requestPasswordResetSuccess({
        message: response?.message || 'If an account exists, a reset link has been sent.',
        resetLink: response?.resetLink,
      })),
      catchError((error) => of(AuthActions.requestPasswordResetFailure({
        error: error?.error?.message || 'Unable to request a password reset.',
      }))),
    )),
  ));

  resetPassword$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.resetPassword),
    exhaustMap(({ token, password }) => this.api.postData('auth/reset-password', { token, password }).pipe(
      map(() => AuthActions.resetPasswordSuccess()),
      catchError((error) => of(AuthActions.resetPasswordFailure({
        error: error?.error?.message || 'This reset link is invalid or expired.',
      }))),
    )),
  ));

  navigateToVerification$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.registerSuccess),
    tap(({ email, verificationCode }) => {
      localStorage.setItem('pendingVerificationEmail', email);
      void this.router.navigate(['/verify-email'], { state: { email, verificationCode } });
    }),
  ), { dispatch: false });

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    exhaustMap(() => this.api.postData('auth/logout', {}).pipe(
      map(() => AuthActions.logoutSuccess()),
      catchError(() => of(AuthActions.logoutSuccess())),
    )),
  ));

  clearSession$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logoutSuccess),
    tap(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('pendingVerificationEmail');
      void this.router.navigateByUrl('/login', { replaceUrl: true });
    }),
  ), { dispatch: false });
}