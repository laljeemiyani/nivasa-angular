import { Component, Input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type IconPosition = 'left' | 'right';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="computedClass">
      <!-- Left Icon -->
      <ng-container *ngIf="hasIcon && iconPosition === 'left'">
        <span class="mr-1"><ng-content select="[icon]"></ng-content></span>
      </ng-container>

      <ng-content></ng-content>

      <!-- Right Icon -->
      <ng-container *ngIf="hasIcon && iconPosition === 'right'">
        <span class="ml-1"><ng-content select="[icon]"></ng-content></span>
      </ng-container>
    </span>
  `,
  styleUrls: ['./badge.component.css'],
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() size: BadgeSize = 'md';
  @Input({ transform: booleanAttribute }) hasIcon = false;
  @Input() iconPosition: IconPosition = 'left';
  @Input({ transform: booleanAttribute }) glow = false;
  @Input() customClass = '';

  get computedClass(): string {
    const variantClasses: Record<BadgeVariant, string> = {
      default: 'badge-default bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
      primary: 'badge-primary bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300',
      secondary: 'badge-secondary bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
      success: 'badge-success bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
      warning: 'badge-warning bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
      error: 'badge-error bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
      info: 'badge-info bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
      outline:
        'badge-outline bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300',
    };

    const sizeClasses: Record<BadgeSize, string> = {
      sm: 'badge-sm px-2 py-0.5 text-xs',
      md: 'badge-md px-2.5 py-0.5 text-sm',
      lg: 'badge-lg px-3 py-1 text-base',
    };

    return cn(
      'inline-flex items-center justify-center font-medium rounded-full transition-colors',
      variantClasses[this.variant],
      sizeClasses[this.size],
      this.glow ? 'shadow-[0_0_10px_currentColor]' : '',
      this.customClass,
    );
  }
}
