import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule, NavigationStart } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 max-w-md mx-auto transition-colors duration-300">
      <div class="space-y-3 mb-8">
        <h1 class="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Sign in to your account to continue</p>
      </div>

      <!-- Pending approval / account status message (amber, not error) -->
      <div
        *ngIf="errorMessage && pendingApprovalMessage"
        class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start space-x-3"
      >
        <div class="w-5 h-5 text-amber-500 mt-0.5 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="text-amber-800 dark:text-amber-200 text-sm font-medium">{{ errorMessage }}</p>
      </div>
      <!-- Generic login error -->
      <div
        *ngIf="errorMessage && !pendingApprovalMessage"
        class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 backdrop-blur-sm border border-red-100 dark:border-red-800/50 rounded-xl flex items-start space-x-3 animate-slide-up"
      >
        <div class="w-5 h-5 text-red-500 mt-0.5 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="text-red-600 dark:text-red-400 text-sm font-medium">{{ errorMessage }}</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
        <div class="space-y-1.5">
          <label
            for="email"
            class="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Email address
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-slate-400 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="name@example.com"
              class="block w-full !pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 transition-all duration-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
              [ngClass]="{
                'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500':
                  f['email'].invalid && (f['email'].dirty || f['email'].touched),
              }"
            />
          </div>
          <p
            *ngIf="f['email'].invalid && (f['email'].dirty || f['email'].touched)"
            class="text-red-500 text-xs font-medium mt-1.5 flex items-center space-x-1"
          >
            <span *ngIf="f['email'].errors?.['required']">Email is required</span>
            <span *ngIf="f['email'].errors?.['email']">Please enter a valid email</span>
          </p>
        </div>

        <div class="space-y-1.5">
          <label
            for="password"
            class="block text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-slate-400 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <input
              id="password"
              [type]="showPassword ? 'text' : 'password'"
              formControlName="password"
              placeholder="••••••••"
              class="block w-full !pl-11 !pr-12 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-700 transition-all duration-200 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium tracking-wide"
              [ngClass]="{
                'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500':
                  f['password'].invalid &&
                  (f['password'].dirty || f['password'].touched),
              }"
            />
            <button
              type="button"
              (click)="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:outline-none"
            >
              <svg
                *ngIf="showPassword"
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
              <svg
                *ngIf="!showPassword"
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <p
            *ngIf="f['password'].invalid && (f['password'].dirty || f['password'].touched)"
            class="text-red-500 text-xs font-medium mt-1.5 flex items-center space-x-1"
          >
            <span *ngIf="f['password'].errors?.['required']">Password is required</span>
            <span *ngIf="f['password'].errors?.['minlength']">Password must be at least 6 characters</span>
          </p>
        </div>

        <div class="flex items-center justify-between pt-1 pb-1">
          <label class="flex items-center space-x-2.5 cursor-pointer group">
            <div class="relative flex items-center justify-center">
              <input
                type="checkbox"
                class="peer sr-only"
              />
              <div class="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all"></div>
              <svg class="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Remember me</span>
          </label>
          <button
            type="button"
            class="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors focus:outline-none"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          [disabled]="loginForm.invalid || loading"
          class="w-full relative group overflow-hidden bg-primary-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/25"
        >
          <div *ngIf="loading" class="flex items-center space-x-2">
            <div
              class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
            <span>Signing in...</span>
          </div>
          <div *ngIf="!loading" class="flex items-center space-x-2">
            <span>Sign in</span>
            <svg
              class="w-4 h-4 group-hover:translate-x-1 transition-transform"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </button>
      </form>

      <div class="text-center pt-8">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
          Don't have an account?
          <a
            routerLink="/register"
            class="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors ml-1"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;
  errorMessage = '';
  /** True when login failed due to pending/rejected approval (show info style, not error). */
  pendingApprovalMessage = false;
  private previousUrl = '/';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Store the previous URL for back navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['from']) {
      this.previousUrl = navigation.extras.state['from'];
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.pendingApprovalMessage = false;

    this.authService
      .login({
        email: this.f['email'].value,
        password: this.f['password'].value,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            const user = this.authService.currentState.user;
            if (user?.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/resident']);
            }
          } else {
            this.errorMessage =
              response.error || 'Login failed. Please try again.';
            this.pendingApprovalMessage = response.pendingApproval === true;
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err.error?.message || 'Login failed. Please try again.';
          this.pendingApprovalMessage =
            err.status === 403 ||
            err.error?.status === 'pending' ||
            err.error?.status === 'rejected';
        },
      });
  }
}
