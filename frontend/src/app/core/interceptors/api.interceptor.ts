import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const authService = inject(AuthService);
  const router = inject(Router);

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip 401 handling for auth endpoints to prevent infinite loop
      const isAuthUrl = req.url.includes('/auth/login') || req.url.includes('/auth/logout');

      if (error.status === 401 && !isAuthUrl) {
        // Clear token locally WITHOUT making another HTTP request to /logout
        // (that would also 401 and loop forever)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        authService.clearLocalState();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      if (error.status === 410 && error.error?.code === 'ACCOUNT_DELETED') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        authService.clearLocalState();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      return throwError(() => error);
    }),
  );
};
