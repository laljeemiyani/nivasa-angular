import {
  Component,
  Input,
  Output,
  EventEmitter,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'gradient'
  | 'danger'
  | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconPosition = 'left' | 'right';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [class]="computedClass"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)"
    >
      <!-- Loading Spinner -->
      <ng-container *ngIf="loading">
        <svg
          class="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </ng-container>

      <!-- Left Icon -->
      <ng-container *ngIf="hasIcon && iconPosition === 'left' && !loading">
        <span class="mr-2"><ng-content select="[icon]"></ng-content></span>
      </ng-container>

      <span [class]="computedSpanClass">
        <ng-content></ng-content>
      </span>

      <!-- Right Icon -->
      <ng-container *ngIf="hasIcon && iconPosition === 'right'">
        <span class="ml-2"><ng-content select="[icon]"></ng-content></span>
      </ng-container>
    </button>
  `,
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) hasIcon = false;
  @Input() iconPosition: IconPosition = 'left';
  @Input({ transform: booleanAttribute }) glow = false;
  @Input() customClass = '';
  @Input() spanClasses = '';

  @Output() onClick = new EventEmitter<MouseEvent>();

  get computedClass(): string {
    const baseClasses =
      'btn inline-flex items-center justify-center gap-2 w-full sm:w-auto h-auto'; // Adjusted default classes

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'btn-primary bg-primary-600 hover:bg-primary-700 text-white shadow-sm border border-transparent transition-all',
      secondary:
        'btn-secondary bg-secondary-100 hover:bg-secondary-200 text-secondary-900 shadow-sm border border-transparent transition-all',
      outline:
        'btn-outline border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-all',
      ghost: 'btn-ghost hover:bg-gray-100 text-gray-700 transition-all',
      gradient:
        'btn-gradient bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white shadow-md transition-all',
      danger:
        'btn-danger bg-error hover:bg-red-600 text-white shadow-sm transition-all',
      success:
        'btn-success bg-success hover:bg-green-600 text-white shadow-sm transition-all',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'btn-sm px-3 py-1.5 text-sm rounded-md',
      md: 'btn-md px-4 py-2 text-base rounded-lg',
      lg: 'btn-lg px-6 py-3 text-lg rounded-xl',
      xl: 'btn-xl px-8 py-4 text-xl rounded-2xl',
    };

    const glowEffect = this.glow
      ? 'shadow-[0_0_15px_rgba(47,128,237,0.5)]'
      : '';

    return cn(
      baseClasses,
      variantClasses[this.variant],
      sizeClasses[this.size],
      glowEffect,
      this.disabled || this.loading
        ? 'opacity-50 cursor-not-allowed pointer-events-none'
        : '',
      this.customClass,
    );
  }

  get computedSpanClass(): string {
    return cn(
      'transition-transform duration-300 flex items-center gap-2 justify-center',
      this.spanClasses,
      this.variant === 'gradient' ? 'mix-blend-plus-lighter' : '',
    );
  }
}
