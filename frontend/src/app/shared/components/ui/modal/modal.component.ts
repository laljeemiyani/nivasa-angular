import {
  Component,
  Input,
  Output,
  EventEmitter,
  booleanAttribute,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

export type ModalSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | 'full';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative w-full rounded-lg bg-white p-6 shadow-xl max-h-full overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300"
        [class]="computedSizeClass"
      >
        <!-- Optional default close button if closeButton is true, otherwise rely on content -->
        <button
          *ngIf="closeButton"
          class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          (click)="onClose.emit()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span class="sr-only">Close</span>
        </button>

        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-in {
        animation: zoomIn 0.3s ease-out;
      }
      @keyframes zoomIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
  ],
})
export class ModalComponent {
  @Input({ transform: booleanAttribute }) isOpen = false;
  @Input() size: ModalSize = 'md';
  @Input({ transform: booleanAttribute }) closeOnOverlayClick = true;
  @Input({ transform: booleanAttribute }) closeOnEsc = true;
  @Input({ transform: booleanAttribute }) closeButton = false;
  @Input() customClass = '';

  @Output() onClose = new EventEmitter<void>();

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    if (this.isOpen && this.closeOnEsc) {
      this.onClose.emit();
    }
  }

  get computedSizeClass(): string {
    const sizeClasses: Record<ModalSize, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      full: 'max-w-full',
    };

    return cn(sizeClasses[this.size], this.customClass);
  }

  onBackdropClick(event: MouseEvent) {
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      this.onClose.emit();
    }
  }
}

// Subcomponents for Modal parts
@Component({
  selector: 'app-modal-header',
  standalone: true,
  template: `<div [class]="computedClass"><ng-content></ng-content></div>`,
})
export class ModalHeaderComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn('mb-4 flex items-start justify-between', this.customClass);
  }
}

@Component({
  selector: 'app-modal-title',
  standalone: true,
  template: `<h3 [class]="computedClass"><ng-content></ng-content></h3>`,
})
export class ModalTitleComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn(
      'text-xl font-semibold leading-none tracking-tight',
      this.customClass,
    );
  }
}

@Component({
  selector: 'app-modal-description',
  standalone: true,
  template: `<p [class]="computedClass"><ng-content></ng-content></p>`,
})
export class ModalDescriptionComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn('text-sm text-gray-500', this.customClass);
  }
}

@Component({
  selector: 'app-modal-footer',
  standalone: true,
  template: `<div [class]="computedClass"><ng-content></ng-content></div>`,
})
export class ModalFooterComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn(
      'mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0',
      this.customClass,
    );
  }
}

@Component({
  selector: 'app-modal-body',
  standalone: true,
  template: `<div [class]="computedClass"><ng-content></ng-content></div>`,
})
export class ModalBodyComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn('py-4', this.customClass);
  }
}
