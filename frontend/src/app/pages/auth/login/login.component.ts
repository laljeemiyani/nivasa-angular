import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p class="text-gray-600 text-sm">Sign in to access your dashboard</p>
      </div>

      <div
        *ngIf="errorMessage"
        class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
      >
        <div class="w-5 h-5 text-red-500 mt-0.5">⚠</div>
        <p class="text-red-600 text-sm">{{ errorMessage }}</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
        <div class="space-y-2">
          <label
            for="email"
            class="text-sm font-medium text-gray-700 flex items-center space-x-2"
          >
            <svg
              class="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <span>Email address</span>
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            placeholder="Enter your email"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all border-gray-300 focus:bg-white hover:border-gray-400"
            [ngClass]="{
              'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500':
                f['email'].invalid && (f['email'].dirty || f['email'].touched),
            }"
          />
          <p
            *ngIf="
              f['email'].invalid && (f['email'].dirty || f['email'].touched)
            "
            class="text-red-500 text-sm mt-1 flex items-center space-x-1"
          >
            <span>⚠</span>
            <span *ngIf="f['email'].errors?.['required']"
              >Email is required</span
            >
            <span *ngIf="f['email'].errors?.['email']"
              >Please enter a valid email</span
            >
          </p>
        </div>

        <div class="space-y-2">
          <label
            for="password"
            class="text-sm font-medium text-gray-700 flex items-center space-x-2"
          >
            <svg
              class="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Password</span>
          </label>
          <div class="relative">
            <input
              id="password"
              [type]="showPassword ? 'text' : 'password'"
              formControlName="password"
              placeholder="Enter your password"
              class="w-full pl-4 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all border-gray-300 focus:bg-white hover:border-gray-400"
              [ngClass]="{
                'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500':
                  f['password'].invalid &&
                  (f['password'].dirty || f['password'].touched),
              }"
            />
            <button
              type="button"
              (click)="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary-600 transition-colors"
            >
              <svg
                *ngIf="showPassword"
                class="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m15 18-.722-3.25" />
                <path d="M2 8a10.645 10.645 0 0 0 20 0" />
                <path d="m20 15-1.726-2.05" />
                <path d="m4 15 1.727-2.05" />
                <path d="m9 18 .721-3.25" />
              </svg>
              <svg
                *ngIf="!showPassword"
                class="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          <p
            *ngIf="
              f['password'].invalid &&
              (f['password'].dirty || f['password'].touched)
            "
            class="text-red-500 text-sm mt-1 flex items-center space-x-1"
          >
            <span>⚠</span>
            <span *ngIf="f['password'].errors?.['required']"
              >Password is required</span
            >
            <span *ngIf="f['password'].errors?.['minlength']"
              >Password must be at least 6 characters</span
            >
          </p>
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input
              type="checkbox"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            class="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          [disabled]="loginForm.invalid || loading"
          class="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
        >
          <div *ngIf="loading" class="flex items-center space-x-2">
            <div
              class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
            <span>Signing in...</span>
          </div>
          <div *ngIf="!loading" class="flex items-center space-x-2">
            <span>Sign in</span>
            <svg
              class="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </button>
      </form>

      <div class="text-center pt-2">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <a
            routerLink="/register"
            class="font-medium text-primary-600 hover:text-primary-500 transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;
  errorMessage = '';

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

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

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
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err.error?.message || 'Login failed. Please try again.';
        },
      });
  }
}
