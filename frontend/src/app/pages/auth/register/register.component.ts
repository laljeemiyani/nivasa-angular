import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

/** Validates age only when a value is entered; allows empty (optional field). */
function optionalAgeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v === null || v === undefined || v === '') return null;
    const num = Number(v);
    if (Number.isNaN(num)) return { age: true };
    if (num < min) return { age: { min } };
    if (num > max) return { age: { max } };
    return null;
  };
}

/** Min 6 chars (backend). Optional: 8+ with upper, lower, number, special for stronger security. */
export function customPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    if (value.length < 6) return { minlength: { requiredLength: 6 } };
    return null;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  success = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.formBuilder.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, customPasswordValidator()]],
        confirmPassword: ['', [Validators.required]],
        phoneNumber: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
        ],
        age: ['', [optionalAgeValidator(18, 120)]],
        gender: [''],
        wing: ['', [Validators.pattern(/^[A-Fa-f]?$/)]],
        flatNumber: ['', [Validators.pattern(/^$|^([1-9]|1[0-4])(0[1-4])$/)]],
        residentType: ['Owner', [Validators.required]],
      },
      { validators: passwordMatchValidator() },
    );
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      ...this.registerForm.value,
      wing: this.registerForm.value.wing?.toUpperCase(),
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.success = true;
          // No auto-redirect: let user read the message and click "Go to Sign In" when ready
        } else {
          this.errorMessage =
            res.error || 'Registration failed. Please try again.';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Registration failed. Please try again.';
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Helper method for template to check errors
  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
