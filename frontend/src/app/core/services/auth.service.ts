import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'resident';
  status: 'pending' | 'active' | 'inactive';
  phone?: string;
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

  login(credentials: any): Observable<{ success: boolean; error?: string }> {
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
        const errorMessage = error.error?.message || 'Login failed';
        this.updateState({ isLoading: false, error: errorMessage });
        return of({ success: false, error: errorMessage });
      }),
    );
  }

  register(
    userData: any,
  ): Observable<{ success: boolean; user?: any; error?: string }> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      map((response) => ({ success: true, user: response.data.user })),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Registration failed';
        return of({ success: false, error: errorMessage });
      }),
    );
  }

  logout(notify: boolean = true) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.updateState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
    // In Angular, we might want to navigate to login page here OR let a guard handle it
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
