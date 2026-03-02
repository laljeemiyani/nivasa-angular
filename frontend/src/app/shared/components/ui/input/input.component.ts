import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { cn } from '../../../../core/utils/cn';

export type InputVariant = 'default' | 'filled' | 'outlined' | 'underlined';
export type InputSize = 'sm' | 'md' | 'lg';
export type IconPosition = 'left' | 'right';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full">
      <!-- Left Icon -->
      <ng-container *ngIf="hasIcon && iconPosition === 'left'">
        <div
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 flex items-center justify-center pointer-events-none"
        >
          <ng-content select="[icon]"></ng-content>
        </div>
      </ng-container>

      <input
        [type]="type"
        [class]="computedClass"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />

      <!-- Right Icon -->
      <ng-container *ngIf="hasIcon && iconPosition === 'right'">
        <div
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 flex items-center justify-center pointer-events-none"
        >
          <ng-content select="[icon]"></ng-content>
        </div>
      </ng-container>

      <!-- Error Message -->
      <ng-container *ngIf="error">
        <p class="mt-1 text-xs text-error">{{ error }}</p>
      </ng-container>
    </div>
  `,
  styleUrls: ['./input.component.css'],
})
export class InputComponent implements ControlValueAccessor {
  @Input() type = 'text';
  @Input() variant: InputVariant = 'default';
  @Input() size: InputSize = 'md';
  @Input({ transform: booleanAttribute }) hasIcon = false;
  @Input() iconPosition: IconPosition = 'left';
  @Input() error: string | null = null;
  @Input() placeholder = '';
  @Input() customClass = '';
  @Input({ transform: booleanAttribute }) disabled = false;

  value: string = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  get computedClass(): string {
    const variantClasses: Record<InputVariant, string> = {
      default:
        'bg-white border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg shadow-sm w-full transition-colors',
      filled:
        'bg-gray-100 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500 rounded-lg w-full transition-all',
      outlined:
        'bg-transparent border-2 border-gray-300 focus:border-primary-500 rounded-lg w-full transition-colors',
      underlined:
        'bg-transparent border-0 border-b-2 border-gray-300 focus:border-primary-500 focus:ring-0 rounded-none w-full px-0 transition-colors',
    };

    const sizeClasses: Record<InputSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    return cn(
      'block outline-none text-text-primary placeholder-gray-400',
      variantClasses[this.variant],
      sizeClasses[this.size],
      this.hasIcon && this.iconPosition === 'left' ? 'pl-10' : '',
      this.hasIcon && this.iconPosition === 'right' ? 'pr-10' : '',
      this.error ? 'border-error focus:border-error focus:ring-error' : '',
      this.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
      this.customClass,
    );
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  // --- ControlValueAccessor Implementation ---
  writeValue(value: any): void {
    this.value = value || '';
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
