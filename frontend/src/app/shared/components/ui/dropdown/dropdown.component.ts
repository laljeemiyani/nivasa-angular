import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

export type DropdownAlign = 'left' | 'right' | 'center';
export type DropdownWidth = 'auto' | 'full' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown relative inline-block" [class]="customClass">
      <!-- Trigger -->
      <div class="dropdown-trigger cursor-pointer" (click)="toggleDropdown()">
        <ng-content select="[trigger]"></ng-content>
      </div>

      <!-- Dropdown Content -->
      <div
        *ngIf="isOpen"
        [class]="computedContentClass"
        (click)="handleSelect()"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class DropdownComponent {
  @Input() align: DropdownAlign = 'left';
  @Input() width: DropdownWidth = 'auto';
  @Input() closeOnSelect = true;
  @Input() customClass = '';

  isOpen = false;

  constructor(private eRef: ElementRef) {}

  @HostListener('document:mousedown', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  get computedContentClass(): string {
    const alignmentClasses: Record<DropdownAlign, string> = {
      left: 'left-0',
      right: 'right-0',
      center: 'left-1/2 -translate-x-1/2',
    };

    const widthClasses: Record<DropdownWidth, string> = {
      auto: 'min-w-[8rem]',
      full: 'w-full',
      sm: 'w-48',
      md: 'w-56',
      lg: 'w-64',
    };

    return cn(
      'dropdown-content absolute z-50 mt-1 rounded-md border border-gray-200 bg-white py-1 shadow-lg',
      alignmentClasses[this.align],
      widthClasses[this.width],
    );
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  handleSelect() {
    if (this.closeOnSelect) {
      this.isOpen = false;
    }
  }
}

// Subcomponents
@Component({
  selector: 'app-dropdown-item',
  standalone: true,
  template: `
    <div [class]="computedClass" (click)="handleClick($event)">
      <ng-content></ng-content>
    </div>
  `,
})
export class DropdownItemComponent {
  @Input() disabled = false;
  @Input() customClass = '';
  @Output() onClick = new EventEmitter<MouseEvent>();

  get computedClass(): string {
    return cn(
      'dropdown-item flex w-full cursor-pointer items-center px-4 py-2 text-sm hover:bg-gray-100',
      this.disabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : '',
      this.customClass,
    );
  }

  handleClick(e: MouseEvent) {
    if (this.disabled) {
      e.stopPropagation();
      return;
    }
    this.onClick.emit(e);
  }
}

@Component({
  selector: 'app-dropdown-separator',
  standalone: true,
  template: `<div [class]="computedClass"></div>`,
})
export class DropdownSeparatorComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn('my-1 h-px bg-gray-200', this.customClass);
  }
}
