import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  booleanAttribute,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { cn } from '../../../../core/utils/cn';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full" [class]="customClass">
      <!-- Trigger Button -->
      <button
        type="button"
        [class]="computedTriggerClass"
        [disabled]="disabled"
        (click)="toggleOpen()"
      >
        <span class="block truncate" [class.text-gray-400]="!selectedValue">
          {{ selectedLabel || placeholder }}
        </span>
        <!-- Dropdown Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4 opacity-50"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <!-- Dropdown Content (Options) -->
      <div
        *ngIf="isOpen"
        class="absolute z-50 w-full mt-1 bg-white overflow-hidden rounded-md border border-gray-200 shadow-lg animate-fade-in-down max-h-60 overflow-y-auto"
      >
        <div class="p-1">
          <div
            *ngFor="let option of options"
            [class]="computedOptionClass(option)"
            (click)="selectOption(option)"
          >
            {{ option.label }}
            <!-- Checkmark for selected item -->
            <ng-container *ngIf="selectedValue === option.value">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4 ml-auto text-primary-600"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </ng-container>
          </div>
          <div
            *ngIf="options.length === 0"
            class="py-2 px-2 text-sm text-gray-500 text-center"
          >
            No options available
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <ng-container *ngIf="error">
        <p class="mt-1 text-xs text-error">{{ error }}</p>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .animate-fade-in-down {
        animation: fadeInDown 0.2s ease-out;
      }
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select an option...';
  @Input() customClass = '';
  @Input() error: string | null = null;
  @Input({ transform: booleanAttribute }) disabled = false;

  @Output() selectionChange = new EventEmitter<any>();

  isOpen = false;
  selectedValue: any = null;
  selectedLabel: string = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      if (this.isOpen) {
        this.onTouched();
      }
    }
  }

  get computedTriggerClass(): string {
    return cn(
      'flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50 transition-colors',
      this.error ? 'border-error focus:ring-error focus:border-error' : '',
    );
  }

  computedOptionClass(option: SelectOption): string {
    return cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-gray-100',
      option.disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer',
      this.selectedValue === option.value
        ? 'bg-primary-50 text-primary-900 font-medium'
        : 'text-gray-900',
    );
  }

  toggleOpen() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.onTouched();
    }
  }

  selectOption(option: SelectOption) {
    if (option.disabled) return;
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;
    this.onChange(this.selectedValue);
    this.selectionChange.emit(this.selectedValue);
  }

  // --- ControlValueAccessor Implementation ---
  writeValue(value: any): void {
    this.selectedValue = value;
    const option = this.options.find((o) => o.value === value);
    if (option) {
      this.selectedLabel = option.label;
    } else {
      this.selectedLabel = ''; // Reset if value not found in options
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
