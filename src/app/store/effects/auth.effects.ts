import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { ApiService } from '../../services/api-service/api-service';
import { MOBILE_API_ENDPOINTS, MOBILE_APP_TEXT, MOBILE_ROUTES, MOBILE_STORAGE_KEYS } from '../../constants/app.constants';
import * as AuthActions from '../actions/auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  login$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.login),
    exhaustMap(({ credentials, returnUrl }) => this.api.postData(MOBILE_API_ENDPOINTS.auth.login, credentials).pipe(
      map((response: any) => response?.success && response.token && response.user
        ? AuthActions.loginSuccess({
            token: response.token,
            refreshToken: response.refreshToken,
            user: response.user,
            returnUrl,
          })
        : AuthActions.loginFailure({ error: response?.message || MOBILE_APP_TEXT.errors.loginFailed })),
      catchError((error) => of(AuthActions.loginFailure({
        error: error?.error?.message || MOBILE_APP_TEXT.errors.unableSignIn,
      }))),
    )),
  ));

  persistLogin$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.loginSuccess),
    tap(({ token, refreshToken, user, returnUrl }) => {
      localStorage.setItem(MOBILE_STORAGE_KEYS.accessToken, token);
      if (refreshToken) localStorage.setItem(MOBILE_STORAGE_KEYS.refreshToken, refreshToken);
      localStorage.setItem(MOBILE_STORAGE_KEYS.user, JSON.stringify(user));

      const destination = returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
        ? returnUrl
        : user.isDeliveryPartner ? MOBILE_ROUTES.delivery : MOBILE_ROUTES.dashboard;
      void this.router.navigateByUrl(destination, { replaceUrl: true });
    }),
  ), { dispatch: false });

  register$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.register),
    exhaustMap(({ user }) => this.api.postData(MOBILE_API_ENDPOINTS.auth.register, user).pipe(
      map((response: any) => response?.success
        ? AuthActions.registerSuccess({ email: user.email, verificationCode: response.verificationCode })
        : AuthActions.registerFailure({ error: response?.message || MOBILE_APP_TEXT.errors.registrationFailed })),
      catchError((error) => of(AuthActions.registerFailure({
        error: error?.error?.message || MOBILE_APP_TEXT.errors.unableCreateAccount,
      }))),
    )),
  ));

  verifyOtp$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.verifyOtp),
    exhaustMap(({ email, otp }) => this.api.postData(MOBILE_API_ENDPOINTS.auth.verifyOtp, { email, otp }).pipe(
      map((response: any) => response?.success
        ? AuthActions.verifyOtpSuccess()
        : AuthActions.verifyOtpFailure({ error: response?.message || MOBILE_APP_TEXT.errors.verificationFailed })),
      catchError((error) => of(AuthActions.verifyOtpFailure({
        error: error?.error?.message || MOBILE_APP_TEXT.errors.unableVerifyEmail,
      }))),
    )),
  ));

  resendOtp$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.resendOtp),
    exhaustMap(({ email }) => this.api.postData(MOBILE_API_ENDPOINTS.auth.sendOtp, { email }).pipe(
      map((response: any) => response?.success
        ? AuthActions.resendOtpSuccess({ verificationCode: response.verificationCode })
        : AuthActions.resendOtpFailure({ error: response?.message || MOBILE_APP_TEXT.errors.unableResendCode })),
      catchError((error) => of(AuthActions.resendOtpFailure({
        error: error?.error?.message || MOBILE_APP_TEXT.errors.unableResendCodeRetry,
      }))),
    )),
  ));

  requestPasswordReset$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.requestPasswordReset),
    exhaustMap(({ email }) => this.api.postData(MOBILE_API_ENDPOINTS.auth.forgotPassword, { email }).pipe(
      map((response: any) => AuthActions.requestPasswordResetSuccess({
        message: response?.message || MOBILE_APP_TEXT.recovery.requestFallback,
        resetLink: response?.resetLink,
      })),
      catchError((error) => of(AuthActions.requestPasswordResetFailure({
        error: error?.error?.message || MOBILE_APP_TEXT.recovery.requestFailed,
      }))),
    )),
  ));

  resetPassword$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.resetPassword),
    exhaustMap(({ token, password }) => this.api.postData(MOBILE_API_ENDPOINTS.auth.resetPassword, { token, password }).pipe(
      map(() => AuthActions.resetPasswordSuccess()),
      catchError((error) => of(AuthActions.resetPasswordFailure({
        error: error?.error?.message || MOBILE_APP_TEXT.recovery.invalidLink,
      }))),
    )),
  ));

  navigateToVerification$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.registerSuccess),
    tap(({ email, verificationCode }) => {
      localStorage.setItem(MOBILE_STORAGE_KEYS.pendingVerificationEmail, email);
      void this.router.navigate([MOBILE_ROUTES.verifyEmail], { state: { email, verificationCode } });
    }),
  ), { dispatch: false });

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logout),
    exhaustMap(() => this.api.postData(MOBILE_API_ENDPOINTS.auth.logout, {}).pipe(
      map(() => AuthActions.logoutSuccess()),
      catchError(() => of(AuthActions.logoutSuccess())),
    )),
  ));

  clearSession$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.logoutSuccess),
    tap(() => {
      localStorage.removeItem(MOBILE_STORAGE_KEYS.accessToken);
      localStorage.removeItem(MOBILE_STORAGE_KEYS.refreshToken);
      localStorage.removeItem(MOBILE_STORAGE_KEYS.user);
      localStorage.removeItem(MOBILE_STORAGE_KEYS.pendingVerificationEmail);
      void this.router.navigateByUrl(MOBILE_ROUTES.login, { replaceUrl: true });
    }),
  ), { dispatch: false });
}