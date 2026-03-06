import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';
import { NotificationBellComponent } from '../../shared/components/notification-bell/notification-bell.component';
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
} from '../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationBellComponent,
    IconHomeComponent,
    IconUsersComponent,
    IconExclamationTriangleComponent,
    IconMegaphoneComponent,
    IconTruckComponent,
    IconXMarkComponent,
    IconBars3Component,
    IconUserCircleComponent,
    IconLogoutComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Mobile sidebar -->
      <div
        class="fixed inset-0 z-50 lg:hidden"
        [class.block]="sidebarOpen"
        [class.hidden]="!sidebarOpen"
      >
        <div
          class="fixed inset-0 bg-gray-600 bg-opacity-75"
          (click)="setSidebarOpen(false)"
        ></div>
        <div class="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div class="flex h-16 items-center justify-between px-4">
            <a routerLink="/admin" class="flex items-center gap-2">
              <img
                src="/assets/nivasa-logo.svg"
                alt="Nivasa logo"
                class="h-8 w-auto"
              />
              <span class="text-lg font-semibold text-gray-900">Admin</span>
            </a>
            <button
              (click)="setSidebarOpen(false)"
              class="text-gray-400 hover:text-gray-600"
            >
              <app-icon-xmark customClass="h-6 w-6"></app-icon-xmark>
            </button>
          </div>
          <nav class="flex-1 px-4 py-4 space-y-1">
            <a
              *ngFor="let item of navigation"
              [routerLink]="item.href"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
              [ngClass]="
                isActive(item.href)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              "
              (click)="setSidebarOpen(false)"
            >
              <ng-container [ngSwitch]="item.icon">
                <app-icon-home
                  *ngSwitchCase="'home'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-home>
                <app-icon-users
                  *ngSwitchCase="'users'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-users>
                <app-icon-exclamation-triangle
                  *ngSwitchCase="'exclamation'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-exclamation-triangle>
                <app-icon-megaphone
                  *ngSwitchCase="'megaphone'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-megaphone>
                <app-icon-truck
                  *ngSwitchCase="'truck'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-truck>
                <app-icon-user-circle
                  *ngSwitchCase="'user'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-user-circle>
              </ng-container>
              {{ item.name }}
            </a>
          </nav>
        </div>
      </div>

      <!-- Desktop sidebar -->
      <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div class="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div class="flex h-16 items-center px-4">
            <a routerLink="/admin" class="flex items-center gap-2">
              <img
                src="/assets/nivasa-logo.svg"
                alt="Nivasa logo"
                class="h-8 w-auto"
              />
              <span class="text-lg font-semibold text-gray-900"
                >Admin Panel</span
              >
            </a>
          </div>
          <nav class="flex-1 px-4 py-4 space-y-1">
            <a
              *ngFor="let item of navigation"
              [routerLink]="item.href"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
              [ngClass]="
                isActive(item.href)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              "
            >
              <ng-container [ngSwitch]="item.icon">
                <app-icon-home
                  *ngSwitchCase="'home'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-home>
                <app-icon-users
                  *ngSwitchCase="'users'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-users>
                <app-icon-exclamation-triangle
                  *ngSwitchCase="'exclamation'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-exclamation-triangle>
                <app-icon-megaphone
                  *ngSwitchCase="'megaphone'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-megaphone>
                <app-icon-truck
                  *ngSwitchCase="'truck'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-truck>
                <app-icon-user-circle
                  *ngSwitchCase="'user'"
                  customClass="mr-3 h-5 w-5"
                ></app-icon-user-circle>
              </ng-container>
              {{ item.name }}
            </a>
          </nav>
        </div>
      </div>

      <!-- Main content -->
      <div class="lg:pl-64">
        <!-- Top bar -->
        <div
          class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
        >
          <button
            type="button"
            class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            (click)="setSidebarOpen(true)"
          >
            <app-icon-bars3 customClass="h-6 w-6"></app-icon-bars3>
          </button>

          <div class="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
            <app-notification-bell></app-notification-bell>

            <!-- User menu -->
            <div class="flex items-center gap-x-2">
              <ng-container *ngIf="user?.profilePhotoUrl; else defaultAvatar">
                <img
                  [src]="getProfilePhotoUrl(user?.profilePhotoUrl)"
                  alt="Profile"
                  class="h-8 w-8 rounded-full object-cover"
                />
              </ng-container>
              <ng-template #defaultAvatar>
                <app-icon-user-circle
                  customClass="h-8 w-8 text-gray-400"
                ></app-icon-user-circle>
              </ng-template>

              <div class="hidden lg:block">
                <p class="text-sm font-medium text-gray-900">
                  {{ user?.fullName }}
                </p>
                <p class="text-xs text-gray-500">Administrator</p>
              </div>
            </div>

            <!-- Logout Button -->
            <button
              (click)="handleLogout()"
              class="flex items-center gap-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <app-icon-logout customClass="h-5 w-5"></app-icon-logout>
              <span class="hidden lg:block">Logout</span>
            </button>
          </div>
        </div>

        <!-- Page content -->
        <main class="py-6">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent implements OnInit {
  sidebarOpen = false;
  user: any = null;
  currentPath = '';

  navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'home' },
    { name: 'Residents', href: '/admin/residents', icon: 'users' },
    { name: 'Complaints', href: '/admin/complaints', icon: 'exclamation' },
    { name: 'Notices', href: '/admin/notices', icon: 'megaphone' },
    { name: 'Family Members', href: '/admin/family-members', icon: 'users' },
    { name: 'Vehicles', href: '/admin/vehicles', icon: 'truck' },
    { name: 'Notifications', href: '/admin/notifications', icon: 'megaphone' },
    {
      name: 'Parking Requests',
      href: '/admin/parking-requests',
      icon: 'truck',
    },
    {
      name: 'Client Profile',
      href: '/admin/client-profile',
      icon: 'user',
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
  }

  setSidebarOpen(open: boolean) {
    this.sidebarOpen = open;
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isActive(href: string): boolean {
    if (href === '/admin') {
      return this.currentPath === '/admin' || this.currentPath === '/admin/';
    }
    return this.currentPath.startsWith(href);
  }

  getProfilePhotoUrl(filename: string): string {
    return `/uploads/profile_photos/${filename}`;
  }
}
