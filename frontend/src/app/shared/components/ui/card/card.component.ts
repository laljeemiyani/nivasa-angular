import { Component, Input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../core/utils/cn';

export type CardVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'gradient'
  | 'dark';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="computedClass">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./card.component.css'],
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input({ transform: booleanAttribute }) hover = false;
  @Input({ transform: booleanAttribute }) glassmorphism = false;
  @Input({ transform: booleanAttribute }) bordered = false;
  @Input() customClass = '';

  get computedClass(): string {
    const variantClasses: Record<CardVariant, string> = {
      default: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
      primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-900 dark:text-primary-300 border-primary-200 dark:border-primary-800',
      secondary: 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-900 dark:text-secondary-300 border-secondary-200 dark:border-secondary-800',
      gradient:
        'bg-gradient-to-br from-primary-600 to-secondary-600 text-white',
      dark: 'bg-slate-800 dark:bg-slate-900 text-white',
    };

    return cn(
      'rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden transition-all duration-300',
      variantClasses[this.variant],
      this.hover ? 'hover:shadow-card-hover hover:-translate-y-1' : '',
      this.glassmorphism
        ? 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-xl'
        : '',
      this.bordered ? 'border border-slate-200 dark:border-slate-700' : '',
      this.customClass,
    );
  }
}

// Subcomponents for Card parts
@Component({
  selector: 'app-card-header',
  standalone: true,
  template: `<div [class]="computedClass"><ng-content></ng-content></div>`,
})
export class CardHeaderComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn('flex flex-col space-y-2 p-6 pb-3', this.customClass);
  }
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `<h3 [class]="computedClass"><ng-content></ng-content></h3>`,
})
export class CardTitleComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn(
      'text-xl font-semibold leading-none tracking-tight',
      this.customClass,
    );
  }
}

@Component({
  selector: 'app-card-description',
  standalone: true,
  template: `<p [class]="computedClass"><ng-content></ng-content></p>`,
})
export class CardDescriptionComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn('text-sm text-text-secondary/80', this.customClass);
  }
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  template: `<div [class]="computedClass"><ng-content></ng-content></div>`,
})
export class CardContentComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn('p-6 pt-0', this.customClass);
  }
}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  template: `<div [class]="computedClass"><ng-content></ng-content></div>`,
})
export class CardFooterComponent {
  @Input() customClass = '';
  get computedClass(): string {
    return cn('flex items-center p-6 pt-0', this.customClass);
  }
}
