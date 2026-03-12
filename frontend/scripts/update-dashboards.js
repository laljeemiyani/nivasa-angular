const fs = require('fs');
const path = require('path');

const adminDashPath = path.join(__dirname, '../src/app/pages/admin/dashboard/dashboard.component.ts');
const residentDashPath = path.join(__dirname, '../src/app/pages/resident/dashboard/dashboard.component.ts');

const adminTemplate = `  template: \`
    <div class="space-y-8 pb-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-display font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p class="text-slate-500 font-medium mt-1">
            Overview of Nivasa Society Management System
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
            Export Report
          </button>
          <button class="bg-indigo-600 border border-transparent text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            + New Resident
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-card *ngFor="let stat of statCards" class="group rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden bg-white">
            <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 [class]="stat.gradientFrom + ' ' + stat.gradientTo""></div>
            <app-card-content class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {{ stat.title }}
                  </p>
                  <p class="text-3xl font-display font-bold text-slate-900">
                    {{ stat.value }}
                  </p>
                </div>
                <div [class]="'p-4 rounded-xl flex items-center justify-center transition-colors ' + stat.bgColor + ' ' + stat.color">
                  <ng-container [ngSwitch]="stat.icon">
                    <app-icon-users *ngSwitchCase="'users'" class="h-7 w-7 transition-transform group-hover:scale-110"></app-icon-users>
                    <app-icon-clock *ngSwitchCase="'clock'" class="h-7 w-7 transition-transform group-hover:scale-110"></app-icon-clock>
                    <app-icon-exclamation-triangle *ngSwitchCase="'exclamation'" class="h-7 w-7 transition-transform group-hover:scale-110"></app-icon-exclamation-triangle>
                    <app-icon-megaphone *ngSwitchCase="'megaphone'" class="h-7 w-7 transition-transform group-hover:scale-110"></app-icon-megaphone>
                    <app-icon-truck *ngSwitchCase="'truck'" class="h-7 w-7 transition-transform group-hover:scale-110"></app-icon-truck>
                  </ng-container>
                </div>
              </div>
              <div class="mt-4 flex items-center text-xs font-medium text-slate-500">
                <span class="text-emerald-500 flex items-center mr-2">
                  <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  2.5%
                </span>
                vs last month
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Recent Activities -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <!-- Recent Complaints -->
          <app-card class="rounded-2xl border-none shadow-sm overflow-hidden flex flex-col h-full bg-white">
            <app-card-header class="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
              <div class="flex items-center justify-between">
                <div>
                  <app-card-title class="text-lg font-bold text-slate-900">Recent Complaints</app-card-title>
                  <app-card-description class="text-sm text-slate-500 font-medium">Issues needing attention</app-card-description>
                </div>
                <a routerLink="/admin/complaints" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">View All</a>
              </div>
            </app-card-header>
            <app-card-content class="p-0 flex-1">
              <div class="divide-y divide-slate-50">
                <ng-container *ngIf="recentActivities?.complaints?.length > 0; else noComplaints">
                  <div *ngFor="let complaint of recentActivities.complaints" class="flex items-start p-5 hover:bg-slate-50/50 transition-colors">
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                        <app-icon-exclamation-triangle class="h-5 w-5"></app-icon-exclamation-triangle>
                      </div>
                    </div>
                    <div class="ml-4 flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-0.5">
                        <p class="text-sm font-bold text-slate-900 truncate pr-2">{{ complaint.title }}</p>
                        <span class="text-xs font-medium text-slate-400 whitespace-nowrap">{{ complaint.createdAt | date: 'shortDate' }}</span>
                      </div>
                      <p class="text-sm text-slate-500 mb-2 truncate">Raised by <span class="font-medium text-slate-700">{{ complaint.userId?.fullName }}</span></p>
                      <app-badge [variant]="getComplaintBadgeVariant(complaint.status)" class="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                        {{ complaint.status }}
                      </app-badge>
                    </div>
                  </div>
                </ng-container>
                <ng-template #noComplaints>
                  <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3">
                       <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p class="text-sm font-semibold text-slate-900">All caught up!</p>
                    <p class="text-xs text-slate-500 mt-1">No recent complaints found</p>
                  </div>
                </ng-template>
              </div>
            </app-card-content>
          </app-card>

          <!-- Recent Residents -->
          <app-card class="rounded-2xl border-none shadow-sm overflow-hidden flex flex-col h-full bg-white">
            <app-card-header class="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
              <div class="flex items-center justify-between">
                <div>
                  <app-card-title class="text-lg font-bold text-slate-900">Recent Registrations</app-card-title>
                  <app-card-description class="text-sm text-slate-500 font-medium">New community members</app-card-description>
                </div>
                <a routerLink="/admin/residents" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">View All</a>
              </div>
            </app-card-header>
            <app-card-content class="p-0 flex-1">
              <div class="divide-y divide-slate-50">
                <ng-container *ngIf="recentActivities?.residents?.length > 0; else noResidents">
                  <div *ngFor="let resident of recentActivities.residents" class="flex items-start p-5 hover:bg-slate-50/50 transition-colors">
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <span class="font-bold text-sm">{{ resident.fullName.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="ml-4 flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-0.5">
                        <p class="text-sm font-bold text-slate-900 truncate pr-2">{{ resident.fullName }}</p>
                        <span class="text-xs font-medium text-slate-400 whitespace-nowrap">{{ resident.createdAt | date: 'shortDate' }}</span>
                      </div>
                      <p class="text-sm text-slate-500 mb-2 truncate">{{ resident.email }}</p>
                      <app-badge [variant]="getResidentBadgeVariant(resident.status)" class="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                        {{ resident.status }}
                      </app-badge>
                    </div>
                  </div>
                </ng-container>
                <ng-template #noResidents>
                  <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-3">
                       <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <p class="text-sm font-semibold text-slate-900">No recent activity</p>
                    <p class="text-xs text-slate-500 mt-1">No new registrations recently</p>
                  </div>
                </ng-template>
              </div>
            </app-card-content>
          </app-card>
        </div>
      </ng-container>
    </div>
  \`,`;

const residentTemplate = `  template: \`
    <div class="space-y-8 pb-8">
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg shadow-indigo-900/20">
        <!-- Abstract Shapes -->
        <div class="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div class="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
        
        <div class="relative z-10">
          <h1 class="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-2">
            Welcome back, {{ user?.fullName }}! 👋
          </h1>
          <p class="text-indigo-200 text-base sm:text-lg font-medium max-w-2xl">
            {{ user?.wing && user?.flatNumber ? 'Wing ' + user.wing + ' - Flat ' + user.flatNumber : 'Resident Dashboard' }}
          </p>
        </div>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Status & Quick Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <!-- Status Card -->
          <app-card class="col-span-1 md:col-span-12 lg:col-span-4 rounded-3xl border-none shadow-sm bg-white overflow-hidden relative group">
             <div class="absolute top-0 left-0 w-1 h-full" [ngClass]="user?.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'"></div>
            <app-card-content class="p-8 h-full flex flex-col justify-center">
              <div class="flex items-start space-x-5">
                <div class="p-4 rounded-2xl" [ngClass]="user?.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'">
                  <app-icon-user-circle class="h-8 w-8"></app-icon-user-circle>
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Account Status
                  </h3>
                  <div class="flex flex-col items-start space-y-2 mt-1">
                    <app-badge [variant]="user?.status === 'approved' ? 'success' : 'warning'" class="text-sm px-3 py-1 font-bold">
                      {{ user?.status }}
                    </app-badge>
                    <span class="text-sm font-medium text-slate-500">
                      {{ user?.status === 'approved' ? 'Full featured access' : 'Awaiting admin approval' }}
                    </span>
                  </div>
                </div>
              </div>
            </app-card-content>
          </app-card>

          <!-- Quick Stats -->
          <div class="col-span-1 md:col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <app-card class="rounded-3xl border-none shadow-sm bg-white hover:shadow-md transition-shadow group">
              <app-card-content class="p-6">
                <div class="flex flex-col">
                  <div class="p-3 rounded-xl bg-blue-50 text-blue-600 w-max mb-4 transition-transform group-hover:scale-110">
                    <app-icon-megaphone class="h-6 w-6"></app-icon-megaphone>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Active Notices</p>
                    <p class="text-4xl font-display font-bold text-slate-900">{{ notices.length }}</p>
                  </div>
                </div>
              </app-card-content>
            </app-card>

            <app-card class="rounded-3xl border-none shadow-sm bg-white hover:shadow-md transition-shadow group">
              <app-card-content class="p-6">
                <div class="flex flex-col">
                  <div class="p-3 rounded-xl bg-rose-50 text-rose-600 w-max mb-4 transition-transform group-hover:scale-110">
                    <app-icon-exclamation-triangle class="h-6 w-6"></app-icon-exclamation-triangle>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">My Complaints</p>
                    <p class="text-4xl font-display font-bold text-slate-900">{{ complaints.length }}</p>
                  </div>
                </div>
              </app-card-content>
            </app-card>

            <app-card class="rounded-3xl border-none shadow-sm bg-white hover:shadow-md transition-shadow group">
              <app-card-content class="p-6">
                <div class="flex flex-col">
                  <div class="p-3 rounded-xl bg-emerald-50 text-emerald-600 w-max mb-4 transition-transform group-hover:scale-110">
                    <app-icon-check-circle class="h-6 w-6"></app-icon-check-circle>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Resolved Issues</p>
                    <p class="text-4xl font-display font-bold text-slate-900">{{ getResolvedComplaintsCount() }}</p>
                  </div>
                </div>
              </app-card-content>
            </app-card>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <!-- Recent Notices -->
          <app-card class="rounded-3xl border-none shadow-sm bg-white flex flex-col h-full overflow-hidden">
            <app-card-header class="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
               <div class="flex items-center justify-between">
                <div>
                  <app-card-title class="text-lg font-bold text-slate-900">Society Notices</app-card-title>
                  <app-card-description class="text-sm text-slate-500 font-medium">Important announcements</app-card-description>
                </div>
                <a routerLink="/resident/notices" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">View All</a>
              </div>
            </app-card-header>
            <app-card-content class="p-0 flex-1">
              <div class="divide-y divide-slate-50">
                <ng-container *ngIf="notices.length > 0; else noNotices">
                  <div *ngFor="let notice of notices.slice(0,3)" class="p-5 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 mt-1">
                        <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <app-icon-megaphone class="h-5 w-5"></app-icon-megaphone>
                        </div>
                      </div>
                      <div class="ml-4 flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                           <p class="text-sm font-bold text-slate-900 truncate pr-4">{{ notice.title }}</p>
                           <span class="text-xs font-medium text-slate-400 whitespace-nowrap">{{ notice.createdAt | date: 'MMM d' }}</span>
                        </div>
                        <p class="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
                          {{ notice.description }}
                        </p>
                        <app-badge variant="info" class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                          {{ notice.priority || 'General' | titlecase }}
                        </app-badge>
                      </div>
                    </div>
                  </div>
                </ng-container>
                <ng-template #noNotices>
                  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                       <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                    </div>
                    <p class="text-sm font-semibold text-slate-900">No recent notices</p>
                    <p class="text-xs text-slate-500 mt-1">You're all caught up with announcements</p>
                  </div>
                </ng-template>
              </div>
            </app-card-content>
          </app-card>

          <!-- My Recent Complaints -->
          <app-card class="rounded-3xl border-none shadow-sm bg-white flex flex-col h-full overflow-hidden">
            <app-card-header class="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
               <div class="flex items-center justify-between">
                <div>
                  <app-card-title class="text-lg font-bold text-slate-900">Recent Complaints</app-card-title>
                  <app-card-description class="text-sm text-slate-500 font-medium">Your raised issues</app-card-description>
                </div>
                <a routerLink="/resident/complaints" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">View All</a>
              </div>
            </app-card-header>
            <app-card-content class="p-0 flex-1">
              <div class="divide-y divide-slate-50">
                <ng-container *ngIf="complaints.length > 0; else noComplaints">
                  <div *ngFor="let complaint of complaints.slice(0,3)" class="p-5 hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 mt-1">
                        <div class="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                          <app-icon-exclamation-triangle class="h-5 w-5"></app-icon-exclamation-triangle>
                        </div>
                      </div>
                      <div class="ml-4 flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                          <p class="text-sm font-bold text-slate-900 truncate pr-4">{{ complaint.title }}</p>
                          <span class="text-xs font-medium text-slate-400 whitespace-nowrap">{{ complaint.createdAt | date: 'MMM d' }}</span>
                        </div>
                        <p class="text-sm text-slate-500 line-clamp-1 mb-3">
                          {{ complaint.description }}
                        </p>
                        <app-badge [variant]="getStatusColor(complaint.status)" class="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                          {{ complaint.status }}
                        </app-badge>
                      </div>
                    </div>
                  </div>
                </ng-container>
                <ng-template #noComplaints>
                  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                       <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <p class="text-sm font-semibold text-slate-900">No complaints found</p>
                    <p class="text-xs text-slate-500 mt-1">If everything's good, that's great!</p>
                  </div>
                </ng-template>
              </div>
            </app-card-content>
          </app-card>
        </div>
      </ng-container>
    </div>
  \`,`;

function updateFile(filePath, templateString) {
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/  template: \`[\s\S]*?\`,/, templateString);
    fs.writeFileSync(filePath, code);
    console.log('Updated ' + filePath);
}

// Ensure the class implementation for the admin dashboard adds gradient styles for cards
function updateAdminClass(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/color: 'text-blue-600',\s*bgColor: 'bg-blue-100',/g, "color: 'text-blue-600', bgColor: 'bg-blue-50', gradientFrom: 'from-blue-500', gradientTo: 'to-indigo-500',");
    code = code.replace(/color: 'text-yellow-600',\s*bgColor: 'bg-yellow-100',/g, "color: 'text-amber-600', bgColor: 'bg-amber-50', gradientFrom: 'from-amber-400', gradientTo: 'to-orange-500',");
    code = code.replace(/color: 'text-red-600',\s*bgColor: 'bg-red-100',/g, "color: 'text-rose-600', bgColor: 'bg-rose-50', gradientFrom: 'from-rose-500', gradientTo: 'to-pink-500',");
    code = code.replace(/color: 'text-orange-600',\s*bgColor: 'bg-orange-100',/g, "color: 'text-orange-600', bgColor: 'bg-orange-50', gradientFrom: 'from-orange-400', gradientTo: 'to-red-500',");
    code = code.replace(/color: 'text-green-600',\s*bgColor: 'bg-green-100',/g, "color: 'text-emerald-600', bgColor: 'bg-emerald-50', gradientFrom: 'from-emerald-400', gradientTo: 'to-teal-500',");
    code = code.replace(/color: 'text-purple-600',\s*bgColor: 'bg-purple-100',/g, "color: 'text-violet-600', bgColor: 'bg-violet-50', gradientFrom: 'from-violet-500', gradientTo: 'to-fuchsia-500',");
    fs.writeFileSync(filePath, code);
}

updateFile(adminDashPath, adminTemplate);
updateFile(residentDashPath, residentTemplate);
updateAdminClass(adminDashPath);
