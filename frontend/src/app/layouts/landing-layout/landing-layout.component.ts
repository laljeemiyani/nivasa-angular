import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  template: `
    <div class="min-h-screen bg-white dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <!-- Navbar -->
      <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16 lg:h-20">
            <!-- Logo -->
            <a routerLink="/" class="flex items-center gap-3 group">
              <div class="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-all duration-300">
                <span class="text-white font-display font-bold text-xl">N</span>
              </div>
              <span class="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Nivasa</span>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden lg:flex items-center gap-8">
              <a *ngFor="let link of navLinks" 
                 [routerLink]="link.href" 
                 [fragment]="link.fragment"
                 (click)="onNavLinkClick(link.fragment)"
                 class="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
                {{ link.name }}
              </a>
            </div>

            <!-- Right side actions -->
            <div class="flex items-center gap-3">
              <app-theme-toggle variant="pill"></app-theme-toggle>
              
              <!-- Auth buttons - Desktop -->
              <div class="hidden sm:flex items-center gap-3">
                <a [routerLink]="['/login']" [state]="{ from: '/' }" class="btn-ghost text-sm">
                  Sign In
                </a>
                <a [routerLink]="['/register']" [state]="{ from: '/' }" class="btn-primary text-sm py-2.5">
                  Get Started
                </a>
              </div>

              <!-- Mobile menu button -->
              <button 
                (click)="mobileMenuOpen = !mobileMenuOpen"
                class="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg *ngIf="!mobileMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg *ngIf="mobileMenuOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu -->
        <div *ngIf="mobileMenuOpen" class="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 animate-fade-in-down">
          <div class="px-4 py-6 space-y-4">
            <a *ngFor="let link of navLinks" 
               [routerLink]="link.href"
               [fragment]="link.fragment"
               (click)="onNavLinkClick(link.fragment)"
               class="block py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
              {{ link.name }}
            </a>
            <div class="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <a [routerLink]="['/login']" [state]="{ from: '/' }" (click)="mobileMenuOpen = false" class="block w-full btn-secondary text-center py-3">
                Sign In
              </a>
              <a [routerLink]="['/register']" [state]="{ from: '/' }" (click)="mobileMenuOpen = false" class="block w-full btn-primary text-center py-3">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main content -->
      <main class="flex-1 pt-16 lg:pt-20">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <!-- Brand -->
            <div class="lg:col-span-2">
              <a routerLink="/" class="flex items-center gap-3 mb-4">
                <div class="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                  <span class="text-white font-display font-bold text-xl">N</span>
                </div>
                <span class="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Nivasa</span>
              </a>
              <p class="text-slate-600 dark:text-slate-400 max-w-md leading-relaxed mb-6">
                Transforming residential society management with modern technology. Connect, manage, and thrive together.
              </p>
              <div class="flex items-center gap-4">
                <a href="#" class="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" class="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" class="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <ul class="space-y-3">
                <li><a routerLink="/" fragment="features" class="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a></li>
                <li><a routerLink="/" fragment="about" class="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</a></li>
                <li><a routerLink="/" fragment="testimonials" class="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Testimonials</a></li>
                <li><a routerLink="/login" class="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sign In</a></li>
              </ul>
            </div>

            <!-- Contact -->
            <div>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Contact</h4>
              <ul class="space-y-3">
                <li class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <svg class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>hello&#64;nivasa.com</span>
                </li>
                <li class="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <svg class="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+91 98765 43210</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Bottom bar -->
          <div class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-sm text-slate-500 dark:text-slate-500">
              &copy; {{ currentYear }} Nivasa Solutions. All rights reserved.
            </p>
            <div class="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-500">
              <a href="#" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</a>
              <a href="#" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class LandingLayoutComponent implements OnInit, AfterViewInit {
  mobileMenuOpen = false;
  currentYear = new Date().getFullYear();

  navLinks = [
    { name: 'Features', href: '/', fragment: 'features' },
    { name: 'About', href: '/', fragment: 'about' },
    { name: 'Testimonials', href: '/', fragment: 'testimonials' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    const currentUser = this.authService.currentState.user;
    if (currentUser) {
      if (currentUser.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/resident']);
      }
    }
  }

  ngAfterViewInit(): void {
    // Handle fragment scrolling after view init
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.scrollToSection(fragment);
      }
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80; // Height of fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    this.mobileMenuOpen = false;
  }

  onNavLinkClick(fragment: string | undefined): void {
    if (fragment) {
      this.scrollToSection(fragment);
    }
  }
}