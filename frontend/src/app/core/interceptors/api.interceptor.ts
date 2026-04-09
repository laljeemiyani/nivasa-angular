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
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        authService.logout(false).subscribe(() => {
          router.navigate(['/login']);
        });
        return throwError(() => error);
      }

      if (error.status === 410 && error.error?.code === 'ACCOUNT_DELETED') {
        authService.logout(false).subscribe(() => {
          router.navigate(['/login']);
        });
        return throwError(() => error);
      }

      return throwError(() => error);
    }),
  );
};
