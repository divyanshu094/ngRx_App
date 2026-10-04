import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MOBILE_API_ENDPOINTS, MOBILE_ROUTES, MOBILE_STORAGE_KEYS } from '../constants/app.constants';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Get token
  const token = localStorage.getItem(MOBILE_STORAGE_KEYS.accessToken);

  // Skip login/register APIs
  const isPublicApi =
    req.url.includes(`/${MOBILE_API_ENDPOINTS.auth.login}`) ||
    req.url.includes(`/${MOBILE_API_ENDPOINTS.auth.register}`) ||
    req.url.includes(`/${MOBILE_API_ENDPOINTS.auth.refreshToken}`);

  let modifiedReq = req;

  // Add Authorization header
  if (token && !isPublicApi) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle unauthorized
      if (error.status === 401) {
        localStorage.removeItem(MOBILE_STORAGE_KEYS.accessToken);
        localStorage.removeItem(MOBILE_STORAGE_KEYS.refreshToken);
        localStorage.removeItem(MOBILE_STORAGE_KEYS.user);

        if (!router.url.startsWith(MOBILE_ROUTES.login)) {
          router.navigate([MOBILE_ROUTES.login], { queryParams: { returnUrl: router.url } });
        }
      }

      return throwError(() => error);
    }),
  );
};
