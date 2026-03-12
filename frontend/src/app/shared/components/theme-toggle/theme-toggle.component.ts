import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggleTheme()"
      [class]="buttonClass"
      type="button"
      [attr.aria-label]="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <!-- Sun icon (shown in dark mode) -->
      <svg
        *ngIf="isDarkMode"
        class="h-5 w-5 text-amber-400 transition-all duration-300 transform rotate-0 scale-100"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      
      <!-- Moon icon (shown in light mode) -->
      <svg
        *ngIf="!isDarkMode"
        class="h-5 w-5 text-slate-600 transition-all duration-300 transform rotate-0 scale-100"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
      
      <span *ngIf="showLabel" class="ml-2 text-sm font-medium">
        {{ isDarkMode ? 'Light' : 'Dark' }}
      </span>
    </button>
  `,
})
export class ThemeToggleComponent implements OnInit {
  @Input() variant: 'icon' | 'pill' | 'button' = 'icon';
  @Input() showLabel = false;
  isDarkMode = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isDarkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  get buttonClass(): string {
    const baseClasses = 'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900';
    
    switch (this.variant) {
      case 'pill':
        return `${baseClasses} p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600`;
      case 'button':
        return `${baseClasses} px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-medium text-slate-700 dark:text-slate-200`;
      default:
        return `${baseClasses} p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800`;
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
