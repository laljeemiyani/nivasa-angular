import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="computedClass">
      <div>
        <h1 *ngIf="title" class="text-2xl font-bold tracking-tight">
          {{ title }}
        </h1>
        <p *ngIf="description" class="text-gray-500">{{ description }}</p>
      </div>
      <div *ngIf="hasContent" class="flex items-center space-x-2">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  @Input() title?: string;
  @Input() description?: string;
  @Input() customClass = '';

  // Note: Angular doesn't easily check if <ng-content> has children in template without extra logic,
  // so we'll wrap it in a div that might be empty if no children are passed.
  // Alternatively, we could accept actions as an input template. For now this is fine.
  hasContent = true;

  get computedClass(): string {
    return cn(
      'flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0',
      this.customClass,
    );
  }
}
