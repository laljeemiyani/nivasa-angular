const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, '../src/app/pages/resident/dashboard/dashboard.component.ts');

const newDashTemplate = `
    <div class="space-y-6 lg:space-y-8 pb-8 animate-fade-in-up max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6 lg:mt-8">
      
      <div *ngIf="loading" class="flex flex-col items-center justify-center h-64">
        <div class="w-10 h-10 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="mt-4 text-sm font-medium text-slate-500">Loading dashboard...</p>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Modern Welcome Banner -->
        <div class="bg-white rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-card border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-200/50 transition-shadow">
          <!-- Abstract Shapes -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full mix-blend-multiply blur-3xl opacity-60 translate-x-1/3 -translate-y-1/2"></div>
          <div class="absolute bottom-0 left-10 w-48 h-48 bg-indigo-50 rounded-full mix-blend-multiply blur-3xl opacity-60 translate-y-1/2"></div>
          
          <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
             <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 shrink-0">
                <span class="text-3xl sm:text-4xl font-display font-bold">{{ user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'R' }}</span>
             </div>
             <div>
               <h1 class="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight mb-1">
                 Welcome back, {{ user?.fullName }}
               </h1>
               <p class="text-slate-500 text-sm font-medium flex items-center gap-2">
                 <span>{{ user?.wing && user?.flatNumber ? 'Wing ' + user.wing + ' - Flat ' + user.flatNumber : 'Resident Dashboard' }}</span>
                 <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                 <span>Resident</span>
               </p>
             </div>
          </div>
          
          <!-- Status Badge embedded in Header -->
          <div class="relative z-10 w-full md:w-auto">
             <div class="flex items-center gap-4 px-5 py-3.5 rounded-2xl border bg-white shadow-sm" [ngClass]="user?.status === 'approved' ? 'border-emerald-100' : 'border-amber-100'">
                <span class="relative flex h-3.5 w-3.5 shrink-0">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" [ngClass]="user?.status === 'approved' ? 'bg-emerald-400' : 'bg-amber-400'"></span>
                  <span class="relative inline-flex rounded-full h-3.5 w-3.5" [ngClass]="user?.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                </span>
                <div>
                   <p class="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Account Status</p>
                   <p class="text-sm sm:text-base font-bold" [ngClass]="user?.status === 'approved' ? 'text-emerald-700' : 'text-amber-700'">
                     {{ user?.status === 'approved' ? 'Active & Approved' : 'Pending Approval' }}
                   </p>
                </div>
             </div>
          </div>
        </div>

        <!-- Quick Stats Grid (Clean 3 columns) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
              <app-icon-megaphone class="w-32 h-32 text-blue-600"></app-icon-megaphone>
            </div>
            <div class="flex items-center justify-between mb-6 relative z-10">
              <div class="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <app-icon-megaphone class="h-6 w-6"></app-icon-megaphone>
              </div>
              <span class="text-4xl font-display font-bold text-slate-800">{{ notices.length }}</span>
            </div>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">Active Notices</p>
          </div>

          <div class="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
              <app-icon-exclamation-triangle class="w-32 h-32 text-rose-600"></app-icon-exclamation-triangle>
            </div>
            <div class="flex items-center justify-between mb-6 relative z-10">
              <div class="p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <app-icon-exclamation-triangle class="h-6 w-6"></app-icon-exclamation-triangle>
              </div>
              <span class="text-4xl font-display font-bold text-slate-800">{{ complaints.length }}</span>
            </div>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">My Complaints</p>
          </div>

          <div class="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity translate-x-4 -translate-y-4">
              <app-icon-check-circle class="w-32 h-32 text-emerald-600"></app-icon-check-circle>
            </div>
            <div class="flex items-center justify-between mb-6 relative z-10">
              <div class="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <app-icon-check-circle class="h-6 w-6"></app-icon-check-circle>
              </div>
              <span class="text-4xl font-display font-bold text-slate-800">{{ getResolvedComplaintsCount() }}</span>
            </div>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">Resolved Issues</p>
          </div>
        </div>

        <!-- Recent Activities Lists -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          
          <!-- Society Notices -->
          <div class="bg-white rounded-[2rem] shadow-card border border-slate-100 flex flex-col h-full overflow-hidden hover:shadow-xl hover:shadow-slate-200/40 transition-shadow">
            <div class="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
               <div>
                  <h3 class="text-[17px] font-bold text-slate-900 tracking-tight">Society Notices</h3>
                  <p class="text-sm text-slate-500 font-medium mt-0.5">Important announcements</p>
               </div>
               <a routerLink="/resident/notices" class="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl">View All</a>
            </div>
            
            <div class="flex-1 p-0">
               <div class="divide-y divide-slate-100/80">
                  <ng-container *ngIf="notices.length > 0; else noNotices">
                     <div *ngFor="let notice of notices.slice(0,4)" class="p-6 hover:bg-slate-50/60 transition-colors group cursor-pointer flex gap-5">
                        <div class="w-11 h-11 shrink-0 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 group-hover:-rotate-3 transition-transform shadow-sm">
                           <app-icon-megaphone class="w-5 h-5"></app-icon-megaphone>
                        </div>
                        <div class="flex-1 min-w-0">
                           <div class="flex items-start justify-between gap-3 mb-1.5">
                              <h4 class="text-[15px] font-bold text-slate-800 truncate">{{ notice.title }}</h4>
                              <span class="text-[11px] font-bold text-slate-400 shrink-0 mt-0.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">{{ notice.createdAt | date: 'MMM d' }}</span>
                           </div>
                           <p class="text-[13px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                             {{ notice.description }}
                           </p>
                           <app-badge variant="info" class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700">
                              {{ notice.priority || 'General' | titlecase }}
                           </app-badge>
                        </div>
                     </div>
                  </ng-container>
                  <ng-template #noNotices>
                    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div class="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                         <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                      </div>
                      <p class="text-[15px] font-bold text-slate-800 tracking-tight">No recent notices</p>
                      <p class="text-sm text-slate-500 mt-1 font-medium">You're all caught up with announcements</p>
                    </div>
                  </ng-template>
               </div>
            </div>
          </div>

          <!-- My Recent Complaints -->
          <div class="bg-white rounded-[2rem] shadow-card border border-slate-100 flex flex-col h-full overflow-hidden hover:shadow-xl hover:shadow-slate-200/40 transition-shadow">
            <div class="px-6 sm:px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
               <div>
                  <h3 class="text-[17px] font-bold text-slate-900 tracking-tight">Recent Complaints</h3>
                  <p class="text-sm text-slate-500 font-medium mt-0.5">Your raised issues</p>
               </div>
               <a routerLink="/resident/complaints" class="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl">View All</a>
            </div>
            
            <div class="flex-1 p-0">
               <div class="divide-y divide-slate-100/80">
                  <ng-container *ngIf="complaints.length > 0; else noComplaints">
                     <div *ngFor="let complaint of complaints.slice(0,4)" class="p-6 hover:bg-slate-50/60 transition-colors cursor-pointer group flex gap-5">
                        <div class="w-11 h-11 shrink-0 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-105 group-hover:rotate-3 transition-transform shadow-sm">
                           <app-icon-exclamation-triangle class="w-5 h-5"></app-icon-exclamation-triangle>
                        </div>
                        <div class="flex-1 min-w-0">
                           <div class="flex items-start justify-between gap-3 mb-1.5">
                              <h4 class="text-[15px] font-bold text-slate-800 truncate">{{ complaint.title }}</h4>
                              <span class="text-[11px] font-bold text-slate-400 shrink-0 mt-0.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">{{ complaint.createdAt | date: 'MMM d' }}</span>
                           </div>
                           <p class="text-[13px] text-slate-500 line-clamp-1 mb-3 leading-relaxed">
                             {{ complaint.description }}
                           </p>
                           <app-badge [variant]="getStatusColor(complaint.status)" class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                              {{ complaint.status }}
                           </app-badge>
                        </div>
                     </div>
                  </ng-container>
                  <ng-template #noComplaints>
                    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div class="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                         <svg class="w-8 h-8 border-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <p class="text-[15px] font-bold text-slate-800 tracking-tight">No complaints found</p>
                      <p class="text-sm text-slate-500 mt-1 font-medium">If everything's good, that's great!</p>
                    </div>
                  </ng-template>
               </div>
            </div>
          </div>

        </div>
      </ng-container>
    </div>
`;

let code = fs.readFileSync(dashPath, 'utf8');
code = code.replace(/template: `[\s\S]*?`,\n}\)/, 'template: `\n' + newDashTemplate + '\n  `,\n})');

fs.writeFileSync(dashPath, code);

console.log('Resident dashboard completely revamped.');
