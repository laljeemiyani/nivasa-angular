import {
  Component,
  Input,
  Output,
  EventEmitter,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

export type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="computedClass" *ngIf="!closed">
      <!-- Icon -->
      <ng-container *ngIf="hasIcon">
        <div class="alert-icon mr-3 flex-shrink-0">
          <ng-content select="[icon]"></ng-content>
        </div>
      </ng-container>

      <div class="alert-content flex-1">
        <h5 *ngIf="title" class="alert-title font-semibold mb-1">
          {{ title }}
        </h5>
        <div class="alert-description text-sm">
          <ng-content></ng-content>
        </div>
      </div>

      <!-- Close Button -->
      <ng-container *ngIf="closable">
        <button
          type="button"
          class="alert-close ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-black/5 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2"
          (click)="handleClose()"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </ng-container>
    </div>
  `,
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'default';
  @Input() title?: string;
  @Input({ transform: booleanAttribute }) hasIcon = false;
  @Input({ transform: booleanAttribute }) closable = false;
  @Input() customClass = '';

  @Output() onClose = new EventEmitter<void>();

  closed = false;

  get computedClass(): string {
    const variantClasses: Record<AlertVariant, string> = {
      default:
        'alert-default bg-gray-50 text-gray-800 border-gray-200 focus-within:ring-gray-500',
      info: 'alert-info bg-blue-50 text-blue-800 border-blue-200 focus-within:ring-blue-500',
      success:
        'alert-success bg-green-50 text-green-800 border-green-200 focus-within:ring-green-500',
      warning:
        'alert-warning bg-yellow-50 text-yellow-800 border-yellow-200 focus-within:ring-yellow-500',
      error:
        'alert-error bg-red-50 text-red-800 border-red-200 focus-within:ring-red-500',
    };

    return cn(
      'alert flex p-4 mb-4 rounded-lg border',
      variantClasses[this.variant],
      this.customClass,
    );
  }

  handleClose() {
    this.closed = true;
    this.onClose.emit();
  }
}
