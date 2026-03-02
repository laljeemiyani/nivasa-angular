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
      default: 'badge-default bg-gray-100 text-gray-800',
      primary: 'badge-primary bg-primary-100 text-primary-800',
      secondary: 'badge-secondary bg-secondary-100 text-secondary-800',
      success: 'badge-success bg-green-100 text-green-800',
      warning: 'badge-warning bg-yellow-100 text-yellow-800',
      error: 'badge-error bg-red-100 text-red-800',
      info: 'badge-info bg-blue-100 text-blue-800',
      outline:
        'badge-outline bg-transparent border border-gray-300 text-gray-700',
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
