import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { environment } from '../../../environments/environment';

import {
  IconHomeComponent,
  IconUsersComponent,
  IconExclamationTriangleComponent,
  IconMegaphoneComponent,
  IconTruckComponent,
  IconXMarkComponent,
  IconBars3Component,
  IconUserCircleComponent,
  IconLogoutComponent,
  IconCogComponent
} from '../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationBellComponent,
    ThemeToggleComponent,
    IconHomeComponent,
    IconUsersComponent,
    IconExclamationTriangleComponent,
    IconMegaphoneComponent,
    IconTruckComponent,
    IconXMarkComponent,
    IconBars3Component,
    IconUserCircleComponent,
    IconLogoutComponent,
    IconCogComponent
  ],
  template: `

    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 selection:bg-primary-500 selection:text-white flex flex-col font-sans transition-colors duration-300">
      <!-- Mobile sidebar -->
      <div class="fixed inset-0 z-50 lg:hidden" [class.block]="sidebarOpen" [class.hidden]="!sidebarOpen">
        <div class="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" (click)="setSidebarOpen(false)"></div>
        <div class="fixed inset-y-0 left-0 flex w-72 flex-col bg-white dark:bg-slate-800 shadow-2xl transition-transform transform border-r border-slate-200 dark:border-slate-700">
          <div class="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <a routerLink="/admin" class="flex items-center gap-3">
              <div class="h-8 w-8 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md border border-primary-500">
                <span class="text-white font-display font-bold text-lg">N</span>
              </div>
              <span class="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white">Admin</span>
            </a>
            <button (click)="setSidebarOpen(false)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 p-1.5 rounded-lg transition-colors shadow-sm">
              <app-icon-xmark customClass="h-5 w-5"></app-icon-xmark>
            </button>
          </div>
          <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <div class="px-3 mb-4 flex items-center">
              <span class="text-[12px] font-extrabold text-primary-700 dark:text-primary-400 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-lg border border-primary-200/50 dark:border-primary-800/50 shadow-[0_1px_2px_rgba(0,0,0,0.05)] inline-flex items-center gap-2 w-full">
                <span class="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50"></span>
                Admin MENU
              </span>
            </div>
            <a *ngFor="let item of navigation" [routerLink]="item.href" class="group flex items-center px-4 py-3 text-[14px] font-semibold rounded-xl transition-all duration-200 relative overflow-hidden" [ngClass]="isActive(item.href) ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-100/50 dark:border-primary-800/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'" (click)="setSidebarOpen(false)">
              <div *ngIf="isActive(item.href)" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-600 rounded-r-full"></div>
              <ng-container [ngSwitch]="item.icon">
                <app-icon-home *ngSwitchCase="'home'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'"></app-icon-home>
                <app-icon-users *ngSwitchCase="'users'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'"></app-icon-users>
                <app-icon-exclamation-triangle *ngSwitchCase="'exclamation'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'"></app-icon-exclamation-triangle>
                <app-icon-megaphone *ngSwitchCase="'megaphone'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'"></app-icon-megaphone>
                <app-icon-truck *ngSwitchCase="'truck'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'"></app-icon-truck>
                <app-icon-user-circle *ngSwitchCase="'user'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'"></app-icon-user-circle>
                <svg *ngSwitchCase="'bell'" xmlns="http://www.w3.org/2000/svg" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <app-icon-cog *ngSwitchCase="'cog'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'"></app-icon-cog>
              </ng-container>
              {{ item.name }}
            </a>
          </nav>
          <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
             <a routerLink="/admin/settings" (click)="setSidebarOpen(false)" class="w-full group flex items-center px-4 py-3 text-[14px] font-semibold text-slate-500 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all" [ngClass]="isActive('/admin/settings') ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm border-slate-200 dark:border-slate-600' : '' ">
               <app-icon-cog customClass="mr-3.5 h-5 w-5 group-hover:text-slate-700 dark:group-hover:text-slate-300" [ngClass]="isActive('/admin/settings') ? 'text-slate-700 dark:text-slate-300' : ''"></app-icon-cog> System Settings
             </a>
             <button (click)="setSidebarOpen(false); handleLogoutConfirmation()" class="w-full group flex items-center px-4 py-3 text-[14px] font-semibold text-slate-500 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 hover:shadow-sm border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all">
               <app-icon-logout customClass="mr-3.5 h-5 w-5 group-hover:text-red-500"></app-icon-logout> Logout session
             </button>
          </div>
        </div>
      </div>

      <!-- Desktop sidebar -->
      <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:z-40">
        <div class="flex flex-col flex-grow bg-white dark:bg-slate-800 border-r border-slate-200/80 dark:border-slate-700 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative transition-colors duration-300">
          <div class="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary-50/50 dark:from-primary-900/10 to-transparent pointer-events-none"></div>

          <!-- Logo Area -->
          <div class="flex h-20 items-center px-8 border-b border-slate-200 dark:border-slate-700 relative z-10">
            <a routerLink="/admin" class="flex items-center gap-3.5 transition-transform hover:scale-[1.02] group">
              <div class="h-10 w-10 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20 group-hover:shadow-primary-600/40 border border-primary-500 transition-all">
                <span class="text-white font-display font-bold text-xl tracking-wider">N</span>
              </div>
              <span class="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Admin</span>
            </a>
          </div>
          
          <!-- Navigation -->
          <nav class="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
            <div class="px-4 mb-5 flex items-center">
              <span class="text-[12px] font-extrabold text-primary-700 dark:text-primary-400 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-lg border border-primary-200/50 dark:border-primary-800/50 shadow-[0_1px_2px_rgba(0,0,0,0.05)] inline-flex items-center gap-2 w-full">
                <span class="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50"></span>
                Admin MENU
              </span>
            </div>
            <a *ngFor="let item of navigation" [routerLink]="item.href" class="group flex items-center px-4 py-3 text-[14px] font-semibold rounded-xl transition-all duration-300 relative overflow-hidden" [ngClass]="isActive(item.href) ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm border border-primary-100/50 dark:border-primary-800/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'">
              <div *ngIf="isActive(item.href)" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary-600 rounded-r-full"></div>
              <ng-container [ngSwitch]="item.icon">
                <app-icon-home *ngSwitchCase="'home'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'"></app-icon-home>
                <app-icon-users *ngSwitchCase="'users'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'"></app-icon-users>
                <app-icon-exclamation-triangle *ngSwitchCase="'exclamation'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'"></app-icon-exclamation-triangle>
                <app-icon-megaphone *ngSwitchCase="'megaphone'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'"></app-icon-megaphone>
                <app-icon-truck *ngSwitchCase="'truck'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'"></app-icon-truck>
                <app-icon-user-circle *ngSwitchCase="'user'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'"></app-icon-user-circle>
                <svg *ngSwitchCase="'bell'" xmlns="http://www.w3.org/2000/svg" class="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <app-icon-cog *ngSwitchCase="'cog'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'"></app-icon-cog>
              </ng-container>
              <span class="relative z-10">{{ item.name }}</span>
            </a>
          </nav>
          <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
             <a routerLink="/admin/settings" class="w-full group flex items-center px-4 py-3 text-[14px] font-semibold text-slate-500 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300" [ngClass]="isActive('/admin/settings') ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm border-slate-200 dark:border-slate-600' : '' ">
               <app-icon-cog customClass="mr-3.5 h-5 w-5 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive('/admin/settings') ? 'text-slate-700 dark:text-slate-300' : ''"></app-icon-cog> System Settings
             </a>
             <button (click)="handleLogoutConfirmation()" class="w-full group flex items-center px-4 py-3 text-[14px] font-semibold text-slate-500 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 hover:shadow-sm hover:border hover:border-red-100 dark:hover:border-red-900/30 border border-transparent transition-all duration-300">
               <app-icon-logout customClass="mr-3.5 h-5 w-5 group-hover:text-red-500 transition-transform duration-300 group-hover:scale-110"></app-icon-logout> Logout session
             </button>
          </div>
        </div>
      </div>

      <!-- Logout Custom Modal -->
      <div *ngIf="showLogoutModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
        <div class="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" (click)="showLogoutModal = false"></div>
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-700 transform transition-all sm:my-8 scale-100">
           <div class="p-6 text-center sm:p-8">
              <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100 dark:border-red-800/50 shadow-sm relative">
                 <div class="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping opacity-20"></div>
                 <app-icon-logout customClass="h-8 w-8 text-red-500"></app-icon-logout>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Sign Out</h3>
              <p class="text-[14px] text-slate-500 dark:text-slate-400 font-medium px-2 leading-relaxed">
                 Are you sure you want to log out of your session? You will need to log in again.
              </p>
           </div>
           <div class="px-6 py-4 bg-slate-50/80 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3 sm:px-8 sm:flex-row flex-col-reverse">
              <button (click)="showLogoutModal = false" type="button" class="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[14px] font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 shadow-sm">
                 Cancel
              </button>
              <button (click)="handleLogout()" type="button" class="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-[14px] font-bold hover:bg-red-700 shadow-sm shadow-red-500/30 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800">
                 Yes, Log Out
              </button>
           </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="lg:pl-72 flex flex-col flex-1">
        <!-- Top bar -->
        <div class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8 transition-all">
          <div class="flex items-center">
            <button type="button" class="-m-2.5 p-2.5 text-slate-600 dark:text-slate-400 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500" (click)="setSidebarOpen(true)">
              <app-icon-bars3 customClass="h-6 w-6"></app-icon-bars3>
            </button>
            <div class="hidden lg:flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 font-medium ml-2">
              <span class="text-slate-900 dark:text-slate-100 tracking-wide">{{ currentPath.split('/')[2] ? (currentPath.split('/')[2] | titlecase) : 'Dashboard' }}</span>
            </div>
          </div>

          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <app-theme-toggle variant="pill"></app-theme-toggle>
            <div class="relative flex items-center">
              <app-notification-bell></app-notification-bell>
            </div>
            <div class="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div>
            <div
              class="flex items-center gap-x-3 px-2 py-1.5 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              (click)="goToSystemSettings()"
            >
              <ng-container *ngIf="user?.profilePhotoUrl; else defaultAvatar">
                <img [src]="getProfilePhotoUrl(user?.profilePhotoUrl)" alt="Profile" class="h-9 w-9 rounded-full object-cover border-2 border-slate-100 dark:border-slate-600 group-hover:border-primary-100 dark:group-hover:border-primary-500/50 transition-colors" />
              </ng-container>
              <ng-template #defaultAvatar>
                <div class="h-9 w-9 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <app-icon-user-circle customClass="h-6 w-6"></app-icon-user-circle>
                </div>
              </ng-template>
              <div class="hidden lg:block text-left">
                <p class="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{{ user?.fullName }}</p>
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Page content wrapper -->
        <main class="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full animate-fade-in relative z-0">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = false;
  showLogoutModal = false;
  user: any = null;
  currentPath = '';
  private isProcessingBackButton = false;

  navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'home' },
    { name: 'Residents', href: '/admin/residents', icon: 'users' },
    { name: 'Complaints', href: '/admin/issues', icon: 'exclamation' },
    { name: 'Notices', href: '/admin/notices', icon: 'megaphone' },
    { name: 'Family Members', href: '/admin/family-members', icon: 'users' },
    { name: 'Vehicles', href: '/admin/vehicles', icon: 'truck' },
    { name: 'Notifications', href: '/admin/notifications', icon: 'megaphone' },
    {
      name: 'Parking Requests',
      href: '/admin/parking-requests',
      icon: 'truck',
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentPath = event.urlAfterRedirects;
      });
  }

  ngOnInit() {
    this.currentPath = this.router.url;
    this.user = this.authService.currentState.user;
    
    // Push initial state to prevent immediate back navigation
    history.pushState({ page: 'admin-panel' }, '', location.href);
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    // Prevent default back navigation and show logout confirmation
    if (!this.isProcessingBackButton && !this.showLogoutModal) {
      this.isProcessingBackButton = true;
      
      // Push state again to prevent navigation
      history.pushState({ page: 'admin-panel' }, '', location.href);
      
      // Show logout confirmation modal
      this.showLogoutModal = true;
      
      // Reset flag after a short delay
      setTimeout(() => {
        this.isProcessingBackButton = false;
      }, 100);
    }
  }

  setSidebarOpen(open: boolean) {
    this.sidebarOpen = open;
  }

  handleLogoutConfirmation() {
    this.showLogoutModal = true;
    this.sidebarOpen = false;
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  handleLogoutCancel() {
    this.showLogoutModal = false;
  }

  isActive(href: string): boolean {
    if (href === '/admin') {
      return this.currentPath === '/admin' || this.currentPath === '/admin/';
    }
    // Strict exact path checking for specific modules to avoid nested path collisions
    return this.currentPath.startsWith(href);
  }

  getProfilePhotoUrl(filename: string): string {
    if (!filename) {
      return '';
    }
    // If backend already returns a full uploads path, use it as-is
    if (filename.startsWith('/uploads/')) {
      return filename;
    }
    return `/uploads/profile_photos/${filename}`;
  }

  goToSystemSettings(): void {
    this.router.navigate(['/admin/settings']);
  }
}
