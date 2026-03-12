const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '../src/app/layouts/admin-layout/admin-layout.component.ts');
const resPath = path.join(__dirname, '../src/app/layouts/resident-layout/resident-layout.component.ts');

function fixLayoutTemplate(filePath, role) {
    const isResident = role === 'resident';
    const roleTitle = isResident ? 'Resident' : 'Admin';
    const profileLink = isResident ? '/resident/profile' : '/admin/client-profile';
    const profileSubtitle = isResident ? "{{ user?.wing && user?.flatNumber ? 'Wing ' + user.wing + ' - ' + user.flatNumber : 'Resident' }}" : "Administrator";

    const newTemplate = `
    <div class="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white flex flex-col font-sans">
      <!-- Mobile sidebar -->
      <div class="fixed inset-0 z-50 lg:hidden" [class.block]="sidebarOpen" [class.hidden]="!sidebarOpen">
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" (click)="setSidebarOpen(false)"></div>
        <div class="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl transition-transform transform border-r border-slate-100">
          <div class="flex h-16 items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
            <a routerLink="/${role}" class="flex items-center gap-3">
              <div class="h-8 w-8 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md border border-primary-500">
                <span class="text-white font-display font-bold text-lg">N</span>
              </div>
              <span class="text-xl font-display font-bold tracking-tight text-slate-900">${roleTitle}<span class="text-primary-600">.</span></span>
            </a>
            <button (click)="setSidebarOpen(false)" class="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 p-1.5 rounded-lg transition-colors shadow-sm">
              <app-icon-xmark customClass="h-5 w-5"></app-icon-xmark>
            </button>
          </div>
          <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <div class="px-3 mb-3">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">${roleTitle} MENU</span>
            </div>
            <a *ngFor="let item of navigation" [routerLink]="item.href" class="group flex items-center px-4 py-3 text-[14px] font-semibold rounded-xl transition-all duration-200 relative overflow-hidden" [ngClass]="isActive(item.href) ? 'bg-primary-50 text-primary-700 border border-primary-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'" (click)="setSidebarOpen(false)">
              <div *ngIf="isActive(item.href)" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary-600 rounded-r-full"></div>
              <ng-container [ngSwitch]="item.icon">
                <app-icon-home *ngSwitchCase="'home'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400'"></app-icon-home>
                <app-icon-users *ngSwitchCase="'users'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400'"></app-icon-users>
                <app-icon-exclamation-triangle *ngSwitchCase="'exclamation'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400'"></app-icon-exclamation-triangle>
                <app-icon-megaphone *ngSwitchCase="'megaphone'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400'"></app-icon-megaphone>
                <app-icon-truck *ngSwitchCase="'truck'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400'"></app-icon-truck>
                <app-icon-user-circle *ngSwitchCase="'user'" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400'"></app-icon-user-circle>
                <svg *ngSwitchCase="'bell'" xmlns="http://www.w3.org/2000/svg" class="mr-3.5 h-5 w-5" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </ng-container>
              {{ item.name }}
            </a>
          </nav>
          <div class="p-4 border-t border-slate-100 bg-slate-50/50">
             <button (click)="setSidebarOpen(false); handleLogoutConfirmation()" class="w-full group flex items-center px-4 py-3 text-[14px] font-semibold text-slate-500 rounded-xl hover:bg-white hover:text-red-600 hover:shadow-sm border border-transparent hover:border-red-100 transition-all">
               <app-icon-logout customClass="mr-3.5 h-5 w-5 group-hover:text-red-500"></app-icon-logout> Logout session
             </button>
          </div>
        </div>
      </div>

      <!-- Desktop sidebar -->
      <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:z-40">
        <div class="flex flex-col flex-grow bg-white border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">
          <div class="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary-50/50 to-transparent pointer-events-none"></div>

          <!-- Logo Area -->
          <div class="flex h-20 items-center px-8 border-b border-slate-100 relative z-10">
            <a routerLink="/${role}" class="flex items-center gap-3.5 transition-transform hover:scale-[1.02] group">
              <div class="h-10 w-10 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20 group-hover:shadow-primary-600/40 border border-primary-500 transition-all">
                <span class="text-white font-display font-bold text-xl tracking-wider">N</span>
              </div>
              <span class="text-2xl font-display font-bold text-slate-900 tracking-tight">${roleTitle}<span class="text-primary-600">.</span></span>
            </a>
          </div>
          
          <!-- Navigation -->
          <nav class="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
            <div class="px-4 mb-4">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">${roleTitle} MENU</span>
            </div>
            <a *ngFor="let item of navigation" [routerLink]="item.href" class="group flex items-center px-4 py-3 text-[14px] font-semibold rounded-xl transition-all duration-300 relative overflow-hidden" [ngClass]="isActive(item.href) ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'">
              <div *ngIf="isActive(item.href)" class="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary-600 rounded-r-full"></div>
              <ng-container [ngSwitch]="item.icon">
                <app-icon-home *ngSwitchCase="'home'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'"></app-icon-home>
                <app-icon-users *ngSwitchCase="'users'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'"></app-icon-users>
                <app-icon-exclamation-triangle *ngSwitchCase="'exclamation'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'"></app-icon-exclamation-triangle>
                <app-icon-megaphone *ngSwitchCase="'megaphone'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'"></app-icon-megaphone>
                <app-icon-truck *ngSwitchCase="'truck'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'"></app-icon-truck>
                <app-icon-user-circle *ngSwitchCase="'user'" customClass="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'"></app-icon-user-circle>
                <svg *ngSwitchCase="'bell'" xmlns="http://www.w3.org/2000/svg" class="mr-3.5 h-5 w-5 transition-transform duration-300 group-hover:scale-110" [ngClass]="isActive(item.href) ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </ng-container>
              <span class="relative z-10">{{ item.name }}</span>
            </a>
          </nav>
          <div class="p-4 border-t border-slate-100 bg-slate-50/50">
             <button (click)="handleLogoutConfirmation()" class="w-full group flex items-center px-4 py-3 text-[14px] font-semibold text-slate-500 rounded-xl hover:bg-white hover:text-red-600 hover:shadow-sm hover:border hover:border-red-100 border border-transparent transition-all duration-300">
               <app-icon-logout customClass="mr-3.5 h-5 w-5 group-hover:text-red-500 transition-transform duration-300 group-hover:scale-110"></app-icon-logout> Logout session
             </button>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="lg:pl-72 flex flex-col flex-1">
        <!-- Top bar -->
        <div class="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8 transition-all">
          <div class="flex items-center">
            <button type="button" class="-m-2.5 p-2.5 text-slate-600 lg:hidden hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500" (click)="setSidebarOpen(true)">
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
            <div routerLink="${profileLink}" class="flex items-center gap-x-3 cursor-pointer group px-2 py-1.5 hover:bg-slate-50 rounded-xl transition-colors">
              <ng-container *ngIf="user?.profilePhotoUrl; else defaultAvatar">
                <img [src]="getProfilePhotoUrl(user?.profilePhotoUrl)" alt="Profile" class="h-9 w-9 rounded-full object-cover border-2 border-slate-100 group-hover:border-primary-100 transition-colors" />
              </ng-container>
              <ng-template #defaultAvatar>
                <div class="h-9 w-9 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600">
                  <app-icon-user-circle customClass="h-6 w-6"></app-icon-user-circle>
                </div>
              </ng-template>
              <div class="hidden lg:block text-left">
                <p class="text-sm font-bold text-slate-800 leading-tight">{{ user?.fullName }}</p>
                <p class="text-xs font-semibold text-slate-500">${profileSubtitle}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Page content wrapper -->
        <main class="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full animate-fade-in relative z-0">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>`;

    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/template: `[\s\S]*?`,\n}\)/, 'template: `\n' + newTemplate + '\n  `,\n})');
    fs.writeFileSync(filePath, code);
}

fixLayoutTemplate(adminPath, 'admin');
fixLayoutTemplate(resPath, 'resident');

console.log('Templates fully fixed and rewritten!');
