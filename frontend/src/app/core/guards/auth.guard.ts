import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> {
    return this.authService.state$.pipe(
      filter((auth) => !auth.isLoading),
      take(1),
      map(({ isAuthenticated, user }) => {
        if (!isAuthenticated) {
          return this.router.createUrlTree(['/login']);
        }

        const requiredRole = route.data['requiredRole'] as string | undefined;
        if (requiredRole && user?.role !== requiredRole) {
          return this.router.createUrlTree(['/unauthorized']);
        }

        return true;
      }),
    );
  }
}
