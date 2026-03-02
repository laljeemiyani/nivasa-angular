import { Component, Input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
export type StatusPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block" [class]="containerClass">
      <div [class]="computedClass">
        <ng-container *ngIf="src && !imgError; else fallbackTpl">
          <img
            [src]="src"
            [alt]="alt"
            class="h-full w-full object-cover"
            (error)="onImgError()"
          />
        </ng-container>
        <ng-template #fallbackTpl>
          <span
            class="flex h-full w-full items-center justify-center font-medium"
          >
            {{ getFallbackText() }}
            <ng-content select="[fallback]"></ng-content>
          </span>
        </ng-template>
      </div>

      <!-- Status Indicator -->
      <ng-container *ngIf="status">
        <span [class]="computedStatusClass"></span>
      </ng-container>
    </div>
  `,
  styleUrls: ['./avatar.component.css'],
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() alt = '';
  @Input() size: AvatarSize = 'md';
  @Input() status?: AvatarStatus;
  @Input() statusPosition: StatusPosition = 'bottom-right';
  @Input() fallback?: string;
  @Input({ transform: booleanAttribute }) bordered = false;
  @Input() customClass = '';
  @Input() containerClass = '';

  imgError = false;

  get computedClass(): string {
    const sizeClasses: Record<AvatarSize, string> = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
      '2xl': 'h-20 w-20 text-2xl',
    };

    return cn(
      'avatar relative flex shrink-0 overflow-hidden rounded-full bg-gray-100 text-gray-600',
      sizeClasses[this.size],
      this.bordered
        ? 'ring-2 ring-white ring-offset-2 ring-offset-background'
        : '',
      this.customClass,
    );
  }

  get computedStatusClass(): string {
    const statusClasses: Record<AvatarStatus, string> = {
      online: 'bg-success',
      offline: 'bg-gray-400',
      busy: 'bg-error',
      away: 'bg-warning',
    };

    const statusPositionClasses: Record<StatusPosition, string> = {
      'top-right': 'top-0 right-0',
      'top-left': 'top-0 left-0',
      'bottom-right': 'bottom-0 right-0',
      'bottom-left': 'bottom-0 left-0',
    };

    return cn(
      'absolute block h-2.5 w-2.5 rounded-full ring-2 ring-white',
      statusClasses[this.status!],
      statusPositionClasses[this.statusPosition],
    );
  }

  onImgError() {
    this.imgError = true;
  }

  getFallbackText(): string {
    if (this.fallback && typeof this.fallback === 'string') {
      return this.fallback.charAt(0).toUpperCase();
    }
    return '';
  }
}
