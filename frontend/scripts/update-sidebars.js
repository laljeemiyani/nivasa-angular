const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '../src/app/layouts/admin-layout/admin-layout.component.ts');
const resPath = path.join(__dirname, '../src/app/layouts/resident-layout/resident-layout.component.ts');

function updateSidebar(filePath, role) {
    let code = fs.readFileSync(filePath, 'utf8');

    // Add handleLogoutConfirmation function
    if (!code.includes('handleLogoutConfirmation()')) {
        code = code.replace(
            'handleLogout() {',
            `handleLogoutConfirmation() {
    if (confirm('Are you sure you want to log out of your session?')) {
      this.handleLogout();
    }
  }

  handleLogout() {`
        );
    }

    const titlePrefix = role === 'admin' ? 'Admin' : 'Resident';
    const logoChar = 'N';

    // Desktop Sidebar Template Replace
    const oldDesktopSidebarRegex = /<!-- Desktop sidebar -->[\s\S]*?<!-- Main content -->/;

    const newDesktopSidebar = `<!-- Desktop sidebar -->
      <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:z-40">
        <div class="flex flex-col flex-grow bg-white border-r border-slate-200/80 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative">
          <div class="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary-50/50 to-transparent pointer-events-none"></div>

          <!-- Logo Area -->
          <div class="flex h-20 items-center px-8 border-b border-slate-100 relative z-10">
            <a routerLink="/${role}" class="flex items-center gap-3.5 transition-transform hover:scale-[1.02] group">
              <div class="h-10 w-10 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20 group-hover:shadow-primary-600/40 border border-primary-500 transition-all">
                <span class="text-white font-display font-bold text-xl tracking-wider">${logoChar}</span>
              </div>
              <span class="text-2xl font-display font-bold text-slate-900 tracking-tight">${titlePrefix}<span class="text-primary-600">.</span></span>
            </a>
          </div>
          
          <!-- Navigation -->
          <nav class="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar relative z-10">
            <div class="px-4 mb-4">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">${titlePrefix} MENU</span>
            </div>
            <a
              *ngFor="let item of navigation"
              [routerLink]="item.href"
              class="group flex items-center px-4 py-3 text-[14px] font-semibold rounded-xl transition-all duration-300 relative overflow-hidden"
              [ngClass]="
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
              "
            >
              <!-- Active Indicator Bar -->
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

          <!-- Navigation Footer (Logout) -->
          <div class="p-4 border-t border-slate-100 bg-slate-50/50">
             <button
               (click)="handleLogoutConfirmation()"
               class="w-full group flex items-center px-4 py-3 text-[14px] font-semibold text-slate-500 rounded-xl hover:bg-white hover:text-red-600 hover:shadow-sm hover:border hover:border-red-100 border border-transparent transition-all duration-300"
             >
               <app-icon-logout customClass="mr-3.5 h-5 w-5 group-hover:text-red-500 transition-transform duration-300 group-hover:scale-110"></app-icon-logout>
               Logout session
             </button>
          </div>
        </div>
      </div>

      <!-- Main content -->`;

    code = code.replace(oldDesktopSidebarRegex, newDesktopSidebar);

    // Mobile Sidebar Template Replace
    const oldMobileSidebarRegex = /<!-- Mobile sidebar -->[\s\S]*?<!-- Desktop sidebar -->/;

    const newMobileSidebar = `<!-- Mobile sidebar -->
      <div
        class="fixed inset-0 z-50 lg:hidden"
        [class.block]="sidebarOpen"
        [class.hidden]="!sidebarOpen"
      >
        <div
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          (click)="setSidebarOpen(false)"
        ></div>
        <div class="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl transition-transform transform border-r border-slate-100">
          <div class="flex h-16 items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
            <a routerLink="/${role}" class="flex items-center gap-3">
              <div class="h-8 w-8 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md border border-primary-500">
                <span class="text-white font-display font-bold text-lg">${logoChar}</span>
              </div>
              <span class="text-xl font-display font-bold tracking-tight text-slate-900">${titlePrefix}<span class="text-primary-600">.</span></span>
            </a>
            <button
              (click)="setSidebarOpen(false)"
              class="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 p-1.5 rounded-lg transition-colors shadow-sm"
            >
              <app-icon-xmark customClass="h-5 w-5"></app-icon-xmark>
            </button>
          </div>
          <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            <div class="px-3 mb-3">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">${titlePrefix} MENU</span>
            </div>
            <a
              *ngFor="let item of navigation"
              [routerLink]="item.href"
              class="group flex items-center px-4 py-3 text-[14px] font-semibold rounded-xl transition-all duration-200 relative overflow-hidden"
              [ngClass]="
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700 border border-primary-100/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              "
              (click)="setSidebarOpen(false)"
            >
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
             <button
               (click)="setSidebarOpen(false); handleLogoutConfirmation()"
               class="w-full group flex items-center px-4 py-3 text-[14px] font-semibold text-slate-500 rounded-xl hover:bg-white hover:text-red-600 hover:shadow-sm border border-transparent hover:border-red-100 transition-all"
             >
               <app-icon-logout customClass="mr-3.5 h-5 w-5 group-hover:text-red-500"></app-icon-logout>
               Logout session
             </button>
          </div>
        </div>
      </div>

      <!-- Desktop sidebar -->`;

    code = code.replace(oldMobileSidebarRegex, newMobileSidebar);

    // remove the logout button from the top header since it's now in the sidebar
    const logoutButtonRegex = /<button[\s\S]*?\(click\)="handleLogout\(\)"[\s\S]*?<\/button>/;
    code = code.replace(logoutButtonRegex, '');

    fs.writeFileSync(filePath, code);
}

updateSidebar(adminPath, 'admin');
updateSidebar(resPath, 'resident');

console.log('Sidebar files completely updated!');
