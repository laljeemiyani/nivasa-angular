import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative">
      <!-- Hero Section -->
      <section id="home" class="relative min-h-screen flex items-center overflow-hidden">
        <!-- Background decorations -->
        <div class="absolute inset-0 bg-white dark:bg-slate-900 transition-colors duration-300">
          <!-- Gradient orbs -->
          <div class="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 dark:bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div class="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/20 dark:bg-accent-600/20 rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 2s;"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-full blur-3xl"></div>
          <!-- Pattern overlay -->
          <div class="absolute inset-0 bg-hero-pattern opacity-50"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <!-- Content -->
            <div class="text-center lg:text-left animate-fade-in-up">
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 mb-6">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                <span class="text-sm font-semibold text-primary-700 dark:text-primary-300">Modern Society Management</span>
              </div>
              
              <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight mb-6">
                <span class="text-slate-900 dark:text-white">Manage Your</span>
                <br />
                <span class="gradient-text">Community Better</span>
              </h1>
              
              <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Nivasa is the all-in-one platform for residential societies. Streamline operations, enhance communication, and build a stronger community together.
              </p>
              
              <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a routerLink="/register" class="btn-primary text-base px-8 py-4 w-full sm:w-auto">
                  Get Started
                  <svg class="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a routerLink="/login" class="btn-secondary text-base px-8 py-4 w-full sm:w-auto">
                  Sign In
                </a>
              </div>

              <!-- Stats -->
              <div class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-8">
                <div>
                  <div class="text-3xl font-bold text-slate-900 dark:text-white">10+</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">Societies</div>
                </div>
                <div>
                  <div class="text-3xl font-bold text-slate-900 dark:text-white">500+</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">Residents</div>
                </div>
                <div>
                  <div class="text-3xl font-bold text-slate-900 dark:text-white">98%</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400 mt-1">Satisfaction</div>
                </div>
              </div>
            </div>

            <!-- Hero Image/Illustration -->
            <div class="relative lg:pl-8 animate-fade-in" style="animation-delay: 0.2s;">
              <div class="relative">
                <!-- Main dashboard mockup -->
                <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-black/40 border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <!-- Header -->
                  <div class="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <div class="flex gap-1.5">
                      <div class="w-3 h-3 rounded-full bg-red-400"></div>
                      <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div class="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  <!-- Content -->
                  <div class="p-6 space-y-4">
                    <div class="flex items-center justify-between">
                      <div class="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div class="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg"></div>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                      <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div class="h-8 w-8 bg-primary-500/20 rounded-lg mb-2"></div>
                        <div class="h-3 w-16 bg-slate-200 dark:bg-slate-600 rounded mb-1"></div>
                        <div class="h-6 w-12 bg-slate-300 dark:bg-slate-500 rounded"></div>
                      </div>
                      <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div class="h-8 w-8 bg-accent-500/20 rounded-lg mb-2"></div>
                        <div class="h-3 w-16 bg-slate-200 dark:bg-slate-600 rounded mb-1"></div>
                        <div class="h-6 w-12 bg-slate-300 dark:bg-slate-500 rounded"></div>
                      </div>
                      <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div class="h-8 w-8 bg-success-500/20 rounded-lg mb-2"></div>
                        <div class="h-3 w-16 bg-slate-200 dark:bg-slate-600 rounded mb-1"></div>
                        <div class="h-6 w-12 bg-slate-300 dark:bg-slate-500 rounded"></div>
                      </div>
                    </div>
                    <div class="space-y-2">
                      <div class="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div class="h-3 w-4/5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div class="h-3 w-3/5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
                
                <!-- Floating cards -->
                <div class="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-200 dark:border-slate-700 p-4 animate-float">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                      <svg class="h-5 w-5 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-900 dark:text-white">Complaint Resolved</div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">Water issue fixed</div>
                    </div>
                  </div>
                </div>

                <div class="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-black/40 border border-slate-200 dark:border-slate-700 p-4 animate-float" style="animation-delay: 1s;">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <svg class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-900 dark:text-white">New Notice</div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">AGM Meeting</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-20 lg:py-32 bg-slate-50 dark:bg-slate-800/50 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Section header -->
          <div class="text-center max-w-3xl mx-auto mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold mb-4">
              Features
            </span>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
              Everything You Need to <span class="gradient-text">Manage Your Society</span>
            </h2>
            <p class="text-lg text-slate-600 dark:text-slate-400">
              Powerful tools designed specifically for residential societies. From maintenance to communication, we've got you covered.
            </p>
          </div>

          <!-- Features grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let feature of features; let i = index" 
                 class="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-card dark:shadow-card-dark border border-slate-200 dark:border-slate-700 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                 [style.animation-delay]="i * 0.1 + 's'">
              <div class="h-14 w-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                   [class]="feature.gradientClass">
                <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="feature.icon" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">{{ feature.title }}</h3>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section id="about" class="py-20 lg:py-32 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <!-- Image side -->
            <div class="relative">
              <div class="relative rounded-2xl overflow-hidden">
                <div class="aspect-[4/3] bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <div class="text-center text-white p-8">
                    <div class="text-6xl font-display font-bold mb-4">N</div>
                    <div class="text-xl font-semibold">Building Communities</div>
                  </div>
                </div>
              </div>
              <!-- Stats card -->
              <div class="absolute -bottom-6 -right-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <svg class="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-2xl font-bold text-slate-900 dark:text-white">500+</div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">Happy Residents</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content side -->
            <div>
              <span class="inline-block px-4 py-1.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm font-semibold mb-4">
                About Nivasa
              </span>
              <h2 class="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white mb-6">
                Transforming Society Management for the <span class="gradient-text">Digital Age</span>
              </h2>
              <p class="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Nivasa was born from a simple idea: make society management effortless. We understand the challenges faced by residential communities - from maintenance tracking to resident communication.
              </p>
              <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Our platform brings together powerful tools for administrators and convenient features for residents, creating a seamless experience for everyone involved.
              </p>
              
              <div class="space-y-4">
                <div *ngFor="let point of aboutPoints" class="flex items-start gap-4">
                  <div class="h-6 w-6 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="h-4 w-4 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-slate-700 dark:text-slate-300">{{ point }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section id="testimonials" class="py-20 lg:py-32 bg-slate-50 dark:bg-slate-800/50 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Section header -->
          <div class="text-center max-w-3xl mx-auto mb-16">
            <span class="inline-block px-4 py-1.5 rounded-full bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-sm font-semibold mb-4">
              Testimonials
            </span>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
              Loved by <span class="gradient-text">Communities</span> Everywhere
            </h2>
            <p class="text-lg text-slate-600 dark:text-slate-400">
              See what society administrators and residents have to say about their experience with Nivasa.
            </p>
          </div>

          <!-- Testimonials grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div *ngFor="let testimonial of testimonials" 
                 class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-card dark:shadow-card-dark border border-slate-200 dark:border-slate-700">
              <!-- Stars -->
              <div class="flex gap-1 mb-4">
                <svg *ngFor="let star of [1,2,3,4,5]" class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              
              <p class="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                "{{ testimonial.content }}"
              </p>
              
              <div class="flex items-center gap-4">
                <div class="h-12 w-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold"
                     [class]="testimonial.avatarGradient">
                  {{ testimonial.initials }}
                </div>
                <div>
                  <div class="font-semibold text-slate-900 dark:text-white">{{ testimonial.name }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">{{ testimonial.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 lg:py-32 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="relative rounded-3xl overflow-hidden">
            <!-- Background -->
            <div class="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500"></div>
            <div class="absolute inset-0 bg-hero-pattern opacity-30"></div>
            
            <!-- Content -->
            <div class="relative px-8 py-16 lg:py-20 text-center">
              <h2 class="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
                Ready to Transform Your Society?
              </h2>
              <p class="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                Join societies already using Nivasa to streamline their operations and build stronger communities.
              </p>
              <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a routerLink="/register" class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg w-full sm:w-auto">
                  Get Started
                  <svg class="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a routerLink="/login" class="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/30 w-full sm:w-auto">
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class LandingComponent {
  features = [
    {
      title: 'Resident Management',
      description: 'Easily manage resident profiles, family members, and contact information in one centralized dashboard.',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      gradientClass: 'from-primary-500 to-primary-600',
    },
    {
      title: 'Complaint Tracking',
      description: 'Streamline complaint submission and resolution with automated status updates and notifications.',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      gradientClass: 'from-accent-500 to-accent-600',
    },
    {
      title: 'Notice Board',
      description: 'Keep everyone informed with digital notices, announcements, and important updates.',
      icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
      gradientClass: 'from-success-500 to-success-600',
    },
    {
      title: 'Vehicle Management',
      description: 'Track resident vehicles, parking allocations, and visitor parking requests efficiently.',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      gradientClass: 'from-warning-500 to-warning-600',
    },
    {
      title: 'Maintenance Tracking',
      description: 'Monitor and manage society maintenance requests and track resolution status.',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      gradientClass: 'from-error-500 to-error-600',
    },
    {
      title: 'Real-time Notifications',
      description: 'Instant alerts for important updates, complaints, notices, and community events.',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      gradientClass: 'from-primary-500 to-accent-500',
    },
  ];

  aboutPoints = [
    'Easy setup and onboarding for your entire society',
    'Secure data protection with enterprise-grade security',
    '24/7 dedicated support team for all your needs',
    'Regular updates with new features and improvements',
  ];

  testimonials = [
    {
      content: 'Nivasa has completely transformed how we manage our society. The complaint tracking system alone has saved us countless hours.',
      name: 'Rajesh Patel',
      role: 'Secretary, Sunrise Residency',
      initials: 'RP',
      avatarGradient: 'from-primary-500 to-primary-600',
    },
    {
      content: 'As a resident, I love how easy it is to stay updated with society notices and submit maintenance requests from my phone.',
      name: 'Priya Sharma',
      role: 'Resident, Green Valley',
      initials: 'PS',
      avatarGradient: 'from-accent-500 to-accent-600',
    },
    {
      content: 'The vehicle management feature has solved our parking chaos. Now everything is organized and transparent.',
      name: 'Amit Kumar',
      role: 'Treasurer, Ocean View Apartments',
      initials: 'AK',
      avatarGradient: 'from-success-500 to-success-600',
    },
  ];
}
