import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'nivasa-theme';
  private isBrowser: boolean;
  
  private themeSubject = new BehaviorSubject<Theme>('light');
  public theme$: Observable<Theme> = this.themeSubject.asObservable();
  
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$: Observable<boolean> = this.darkModeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeTheme();
  }

  private initializeTheme(): void {
    if (!this.isBrowser) return;

    // Check localStorage first
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme | null;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.darkModeSubject.next(theme === 'dark');
    
    if (this.isBrowser) {
      localStorage.setItem(this.THEME_KEY, theme);
      
      // Update document class
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  }

  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  get isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  get currentTheme(): Theme {
    return this.themeSubject.value;
  }
}
