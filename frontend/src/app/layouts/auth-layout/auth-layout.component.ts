import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule, ThemeToggleComponent],
  template: `
    <div class="min-h-screen flex text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 selection:bg-primary-500 selection:text-white transition-colors duration-300">
      <!-- Left: Branding (Hidden on mobile) -->
      <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 dark:bg-slate-950 items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-slate-900 to-slate-900 z-0"></div>
        <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"></div>
        
        <!-- Decorative elements -->
        <div class="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div class="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div class="relative z-10 p-12 lg:p-24 flex flex-col justify-between h-full w-full">
          <div>
            <a routerLink="/" class="flex items-center gap-3 group">
              <div class="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-shadow">
                <span class="text-3xl font-display font-bold text-primary-600 tracking-tighter">N</span>
              </div>
              <span class="text-2xl font-display font-bold text-white tracking-tight">Nivasa</span>
            </a>
          </div>
          <div class="space-y-6 max-w-lg">
            <h1 class="text-4xl md:text-5xl lg:text-5xl font-display font-bold text-white leading-[1.15] tracking-tight">
              Elevate your community living experience.
            </h1>
            <p class="text-lg text-primary-200/80 font-medium leading-relaxed">
              Nivasa provides a seamless, modern platform for society management, connecting residents and administration effortlessly.
            </p>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 text-sm font-medium text-slate-400">
              <span>&copy; {{ currentYear }} Nivasa Solutions. All rights reserved.</span>
            </div>
            <app-theme-toggle variant="pill"></app-theme-toggle>
          </div>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-slate-50 dark:bg-slate-900 relative overflow-y-auto transition-colors duration-300">
         <!-- Mobile Logo -->
         <div class="absolute top-8 left-8 lg:hidden flex items-center space-x-3">
            <a routerLink="/" class="flex items-center gap-3">
              <div class="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span class="text-xl font-display font-bold text-white">N</span>
              </div>
              <span class="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Nivasa</span>
            </a>
         </div>

         <!-- Mobile Theme Toggle -->
         <div class="absolute top-8 right-8 lg:hidden">
           <app-theme-toggle variant="pill"></app-theme-toggle>
         </div>

         <div class="w-full max-w-md lg:max-w-xl xl:max-w-2xl animate-fade-in relative z-10 py-12 lg:py-0">
           <router-outlet></router-outlet>
         </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {
  currentYear = new Date().getFullYear();
}
