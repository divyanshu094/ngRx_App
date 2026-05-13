import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Get token
  const token = localStorage.getItem('authToken');

  // Skip login/register APIs
  const isPublicApi =
    req.url.includes('/login') || req.url.includes('/register');

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
        localStorage.removeItem('token');

        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
