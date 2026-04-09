const fs = require('fs');
const path = require('path');

const adminLayoutPath = path.join(__dirname, '../src/app/layouts/admin-layout/admin-layout.component.ts');
const residentLayoutPath = path.join(__dirname, '../src/app/layouts/resident-layout/resident-layout.component.ts');

const adminTemplate = `  template: \`
    <div class="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white flex flex-col font-sans">
      <!-- Mobile sidebar -->
      <div
        class="fixed inset-0 z-50 lg:hidden"
        [class.block]="sidebarOpen"
        [class.hidden]="!sidebarOpen"
      >
        <div
          class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
          (click)="setSidebarOpen(false)"
        ></div>
        <div class="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl transition-transform transform">
          <div class="flex h-16 items-center justify-between px-6 border-b border-slate-100">
            <a routerLink="/admin" class="flex items-center gap-3">
              <div class="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span class="text-white font-display font-bold text-lg">N</span>
              </div>
              <span class="text-xl font-display font-bold tracking-tight">Admin<span class="text-indigo-600">.</span></span>
            </a>
            <button
              (click)="setSidebarOpen(false)"
              class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <app-icon-xmark customClass="h-5 w-5"></app-icon-xmark>
            </button>
          </div>
          <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <a
              *ngFor="let item of navigation"
              [routerLink]="item.href"
              class="group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200"
              [ngClass]="
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              "
              (click)="setSidebarOpen(false)"
            >
              <ng-container [ngSwitch]="item.icon">
                <app-icon-home *ngSwitchCase="'home'" class="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-home>
                <app-icon-users *ngSwitchCase="'users'" class="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-users>
                <app-icon-exclamation-triangle *ngSwitchCase="'exclamation'" class="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-exclamation-triangle>
                <app-icon-megaphone *ngSwitchCase="'megaphone'" class="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-megaphone>
                <app-icon-truck *ngSwitchCase="'truck'" class="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-truck>
                <app-icon-user-circle *ngSwitchCase="'user'" class="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-user-circle>
              </ng-container>
              {{ item.name }}
            </a>
          </nav>
        </div>
      </div>

      <!-- Desktop sidebar -->
      <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:z-40">
        <div class="flex flex-col flex-grow bg-white border-r border-slate-200/60 shadow-sm relative">
          <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>

          <div class="flex h-16 items-center px-6 border-b border-slate-100 relative z-10">
            <a routerLink="/admin" class="flex items-center gap-3 transition-transform hover:scale-[1.02]">
              <div class="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                <span class="text-white font-display font-bold text-lg">N</span>
              </div>
              <span class="text-xl font-display font-bold text-slate-900 tracking-tight">Admin<span class="text-indigo-600">.</span></span>
            </a>
          </div>
          
          <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10">
            <div class="px-3 mb-3">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Main Menu</span>
            </div>
            <a
              *ngFor="let item of navigation"
              [routerLink]="item.href"
              class="group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200"
              [ngClass]="
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              "
            >
              <ng-container [ngSwitch]="item.icon">
                <app-icon-home *ngSwitchCase="'home'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-home>
                <app-icon-users *ngSwitchCase="'users'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-users>
                <app-icon-exclamation-triangle *ngSwitchCase="'exclamation'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-exclamation-triangle>
                <app-icon-megaphone *ngSwitchCase="'megaphone'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-megaphone>
                <app-icon-truck *ngSwitchCase="'truck'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-truck>
                <app-icon-user-circle *ngSwitchCase="'user'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-user-circle>
              </ng-container>
              {{ item.name }}
            </a>
          </nav>
        </div>
      </div>

      <!-- Main content -->
      <div class="lg:pl-72 flex flex-col flex-1">
        <!-- Top bar -->
        <div
          class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8 transition-all"
        >
          <div class="flex items-center">
            <button
              type="button"
              class="-m-2.5 p-2.5 text-slate-600 lg:hidden hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              (click)="setSidebarOpen(true)"
            >
              <app-icon-bars3 customClass="h-6 w-6"></app-icon-bars3>
            </button>
            
            <div class="hidden lg:flex items-center space-x-2 text-sm text-slate-500 font-medium ml-2">
              <span class="text-slate-900 tracking-wide">{{ currentPath.split('/')[2] ? (currentPath.split('/')[2] | titlecase) : 'Dashboard' }}</span>
            </div>
          </div>

          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <div class="relative flex items-center">
              <app-notification-bell></app-notification-bell>
            </div>

            <div class="hidden lg:block h-6 w-px bg-slate-200" aria-hidden="true"></div>

            <div class="flex items-center gap-x-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
              <ng-container *ngIf="user?.profilePhotoUrl; else defaultAvatar">
                <img
                  [src]="getProfilePhotoUrl(user?.profilePhotoUrl)"
                  alt="Profile"
                  class="h-9 w-9 rounded-full object-cover border-2 border-slate-100 group-hover:border-indigo-100 transition-colors"
                />
              </ng-container>
              <ng-template #defaultAvatar>
                <div class="h-9 w-9 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600">
                  <app-icon-user-circle customClass="h-6 w-6"></app-icon-user-circle>
                </div>
              </ng-template>

              <div class="hidden lg:block text-left">
                <p class="text-sm font-bold text-slate-800 leading-tight">
                  {{ user?.fullName }}
                </p>
                <p class="text-xs font-medium text-slate-500">Administrator</p>
              </div>
            </div>

            <button
              (click)="handleLogout()"
              class="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Logout"
            >
              <app-icon-logout customClass="h-5 w-5"></app-icon-logout>
            </button>
          </div>
        </div>

        <!-- Page content wrapper -->
        <main class="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full animate-fade-in relative z-0">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  \`,`;

const residentTemplate = `  template: \`
    <div class="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white flex flex-col font-sans">
      <!-- Mobile sidebar -->
      <div
        class="fixed inset-0 z-50 lg:hidden"
        [class.block]="sidebarOpen"
        [class.hidden]="!sidebarOpen"
      >
        <div
          class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
          (click)="setSidebarOpen(false)"
        ></div>
        <div class="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl transition-transform transform">
          <div class="flex h-16 items-center justify-between px-6 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span class="text-white font-display font-bold text-lg">N</span>
              </div>
              <span class="text-xl font-display font-bold tracking-tight text-slate-900">Nivasa<span class="text-indigo-600">.</span></span>
            </div>
            <button
              (click)="setSidebarOpen(false)"
              class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <app-icon-xmark customClass="h-5 w-5"></app-icon-xmark>
            </button>
          </div>
          <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <a
              *ngFor="let item of navigation"
              [routerLink]="item.href"
              class="group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200"
              [ngClass]="
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              "
              (click)="setSidebarOpen(false)"
            >
              <ng-container [ngSwitch]="item.icon">
                <app-icon-home *ngSwitchCase="'home'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-home>
                <app-icon-user-circle *ngSwitchCase="'user'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-user-circle>
                <app-icon-exclamation-triangle *ngSwitchCase="'exclamation'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-exclamation-triangle>
                <app-icon-megaphone *ngSwitchCase="'megaphone'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-megaphone>
                <svg *ngSwitchCase="'bell'" xmlns="http://www.w3.org/2000/svg" class="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <app-icon-users *ngSwitchCase="'users'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-users>
                <app-icon-truck *ngSwitchCase="'truck'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-truck>
              </ng-container>
              {{ item.name }}
            </a>
          </nav>
        </div>
      </div>

      <!-- Desktop sidebar -->
      <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:z-40">
        <div class="flex flex-col flex-grow bg-white border-r border-slate-200/60 shadow-sm relative">
          <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none"></div>

          <div class="flex h-16 items-center px-6 border-b border-slate-100 relative z-10">
            <div class="flex items-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer" routerLink="/resident">
              <div class="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                <span class="text-white font-display font-bold text-lg">N</span>
              </div>
              <span class="text-xl font-display font-bold text-slate-900 tracking-tight">Resident<span class="text-indigo-600">.</span></span>
            </div>
          </div>
          <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10">
            <div class="px-3 mb-3">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Resident Menu</span>
            </div>
            <a
              *ngFor="let item of navigation"
              [routerLink]="item.href"
              class="group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200"
              [ngClass]="
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              "
            >
              <ng-container [ngSwitch]="item.icon">
                <app-icon-home *ngSwitchCase="'home'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-home>
                <app-icon-user-circle *ngSwitchCase="'user'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-user-circle>
                <app-icon-exclamation-triangle *ngSwitchCase="'exclamation'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-exclamation-triangle>
                <app-icon-megaphone *ngSwitchCase="'megaphone'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-megaphone>
                <svg *ngSwitchCase="'bell'" xmlns="http://www.w3.org/2000/svg" class="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <app-icon-users *ngSwitchCase="'users'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-users>
                <app-icon-truck *ngSwitchCase="'truck'" customClass="mr-3 h-5 w-5 transition-colors" [ngClass]="isActive(item.href) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'"></app-icon-truck>
              </ng-container>
              {{ item.name }}
            </a>
          </nav>
        </div>
      </div>

      <!-- Main content -->
      <div class="lg:pl-72 flex flex-col flex-1">
        <!-- Top bar -->
        <div
          class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8 transition-all"
        >
          <div class="flex items-center">
            <button
              type="button"
              class="-m-2.5 p-2.5 text-slate-600 lg:hidden hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              (click)="setSidebarOpen(true)"
            >
              <app-icon-bars3 customClass="h-6 w-6"></app-icon-bars3>
            </button>
            <div class="hidden lg:flex items-center space-x-2 text-sm text-slate-500 font-medium ml-2">
              <span class="text-slate-900 tracking-wide">{{ currentPath.split('/')[2] ? (currentPath.split('/')[2] | titlecase) : 'Dashboard' }}</span>
            </div>
          </div>

          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <div class="relative flex items-center">
              <app-notification-bell></app-notification-bell>
            </div>

            <div class="hidden lg:block h-6 w-px bg-slate-200" aria-hidden="true"></div>

            <div class="flex items-center gap-x-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
              <ng-container *ngIf="user?.profilePhotoUrl; else defaultAvatar">
                <img
                  [src]="getProfilePhotoUrl(user?.profilePhotoUrl)"
                  alt="Profile"
                  class="h-9 w-9 rounded-full object-cover border-2 border-slate-100 group-hover:border-indigo-100 transition-colors"
                />
              </ng-container>
              <ng-template #defaultAvatar>
                <div class="h-9 w-9 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600">
                  <app-icon-user-circle customClass="h-6 w-6"></app-icon-user-circle>
                </div>
              </ng-template>

              <div class="hidden lg:block text-left">
                <p class="text-sm font-bold text-slate-800 leading-tight">
                  {{ user?.fullName }}
                </p>
                <p class="text-xs font-medium text-indigo-600">
                  {{ user?.wing && user?.flatNumber ? 'Wing ' + user.wing + ' - ' + user.flatNumber : 'Resident' }}
                </p>
              </div>
            </div>

            <button
              (click)="handleLogout()"
              class="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Logout"
            >
              <app-icon-logout customClass="h-5 w-5"></app-icon-logout>
            </button>
          </div>
        </div>

        <!-- Page content wrapper -->
        <main class="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full animate-fade-in relative z-0">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  \`,`;

function updateFile(filePath, templateString) {
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/  template: \`[\s\S]*?\`,/, templateString);
    fs.writeFileSync(filePath, code);
    console.log('Updated ' + filePath);
}

updateFile(adminLayoutPath, adminTemplate);
updateFile(residentLayoutPath, residentTemplate);
