import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

@Component({
  selector: 'app-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label [class]="computedClass">
      <ng-content></ng-content>
    </label>
  `,
})
export class LabelComponent {
  @Input() customClass = '';

  get computedClass(): string {
    return cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      this.customClass,
    );
  }
}
