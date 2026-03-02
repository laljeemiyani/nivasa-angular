import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
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
  ): boolean {
    const { isAuthenticated, user, isLoading } = this.authService.currentState;

    // Simplification for the guard: we assume checkInitialAuth has run.
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRole = route.data['requiredRole'] as string | undefined;

    if (requiredRole && user?.role !== requiredRole) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
