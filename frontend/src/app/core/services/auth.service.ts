import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  /** @deprecated use fullName; backend and UI use fullName */
  name?: string;
  fullName: string;
  email: string;
  role: 'admin' | 'resident';
  status: 'pending' | 'approved' | 'rejected' | 'deleted' | 'inactive';
  phone?: string;
  phoneNumber?: string;
  wing?: string;
  flatNumber?: string;
  profilePhotoUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl + '/auth';
  private stateSubj = new BehaviorSubject<AuthState>(initialState);
  state$ = this.stateSubj.asObservable();

  constructor(private http: HttpClient) {
    this.checkInitialAuth();
  }

  get currentState(): AuthState {
    return this.stateSubj.value;
  }

  private updateState(newState: Partial<AuthState>) {
    this.stateSubj.next({ ...this.currentState, ...newState });
  }

  private checkInitialAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.updateState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        this.logout(false);
        this.updateState({ isLoading: false, error: 'Invalid stored data' });
      }
    } else {
      this.updateState({ isLoading: false, isAuthenticated: false });
    }
  }

  login(credentials: any): Observable<{ success: boolean; error?: string; pendingApproval?: boolean }> {
    this.updateState({ isLoading: true, error: null });
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.updateState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }),
      map(() => ({ success: true })),
      catchError((error) => {
        const status = error.status;
        const body = error.error || {};
        const serverMessage = body.message;
        const accountStatus = body.status;
        const code = body.code;
        const pendingApproval =
          status === 403 ||
          code === 'ACCOUNT_PENDING' ||
          code === 'ACCOUNT_REJECTED' ||
          accountStatus === 'pending' ||
          accountStatus === 'rejected';
        const errorMessage =
          serverMessage ||
          (pendingApproval
            ? 'Your account is pending approval. Please wait until the administrator approves your account.'
            : status === 401
              ? 'Invalid email or password.'
              : 'Login failed. Please try again.');
        this.updateState({ isLoading: false, error: errorMessage });
        return of({ success: false, error: errorMessage, pendingApproval });
      }),
    );
  }

  register(
    userData: any,
  ): Observable<{ success: boolean; user?: any; error?: string }> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      map((response) => ({ success: true, user: response.data.user })),
      catchError((error) => {
        const backend = error.error || {};
        const validationErrors: string[] =
          Array.isArray(backend.errors) && backend.errors.length
            ? backend.errors.map((e: any) => e.msg || e.message).filter(Boolean)
            : [];
        const combinedValidation =
          validationErrors.length > 0 ? validationErrors.join(', ') : null;
        const errorMessage =
          combinedValidation ||
          backend.message ||
          'Registration failed';
        return of({ success: false, error: errorMessage });
      }),
    );
  }

  logout(notify: boolean = true): Observable<{ success: boolean }> {
    // Call logout endpoint to log the event
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      catchError(() => of({ success: true })), // Continue even if logout fails
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateState({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      }),
      map(() => ({ success: true }))
    );
  }

  updateProfile(
    userData: any,
  ): Observable<{ success: boolean; user?: any; error?: string }> {
    return this.http.put<any>(`${this.apiUrl}/profile`, userData).pipe(
      tap((response) => {
        const { user } = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        this.updateState({ user: { ...this.currentState.user, ...user } });
      }),
      map((response) => ({ success: true, user: response.data.user })),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Profile update failed';
        return of({ success: false, error: errorMessage });
      }),
    );
  }

  updateUser(userData: any) {
    return this.updateProfile(userData);
  }

  updateProfilePhoto(
    formData: FormData,
  ): Observable<{ success: boolean; user?: any; error?: string }> {
    return this.http
      .post<any>(`${this.apiUrl}/update-profile-photo`, formData)
      .pipe(
        tap((response) => {
          const { user } = response.data;
          localStorage.setItem('user', JSON.stringify(user));
          this.updateState({ user: { ...this.currentState.user, ...user } });
        }),
        map((response) => ({ success: true, user: response.data.user })),
        catchError((error) => {
          const errorMessage =
            error.error?.message || 'Profile photo update failed';
          return of({ success: false, error: errorMessage });
        }),
      );
  }

  changePassword(
    passwordData: any,
  ): Observable<{ success: boolean; error?: string }> {
    return this.http
      .post<any>(`${this.apiUrl}/change-password`, passwordData)
      .pipe(
        map(() => ({ success: true })),
        catchError((error) => {
          const errorMessage = error.error?.message || 'Password change failed';
          return of({ success: false, error: errorMessage });
        }),
      );
  }

  clearError() {
    this.updateState({ error: null });
  }
}
