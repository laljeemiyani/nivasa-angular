import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
} from '../../../shared/components/ui/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/ui/badge/badge.component';

// Icons using the shared icons component
import {
  IconUsersComponent,
  IconClockComponent,
  IconExclamationTriangleComponent,
  IconMegaphoneComponent,
  IconTruckComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    BadgeComponent,
    IconUsersComponent,
    IconClockComponent,
    IconExclamationTriangleComponent,
    IconMegaphoneComponent,
    IconTruckComponent,
  ],
  template: `
    <div class="space-y-8 pb-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Overview of Nivasa Society Management System
          </p>
        </div>
        <div class="flex items-center space-x-3 mt-4 sm:mt-0">
          <button routerLink="/admin/notices" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 flex items-center gap-2">
            <app-icon-megaphone class="w-4 h-4"></app-icon-megaphone> Broadcast Notice
          </button>
          <button routerLink="/admin/residents" class="bg-indigo-600 border border-transparent text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-2">
            <app-icon-users class="w-4 h-4"></app-icon-users> Manage Residents
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            *ngFor="let stat of statCards"
            [routerLink]="stat.link"
            [queryParams]="stat.queryParams || null"
            class="block group h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl outline-none"
          >
            <app-card class="h-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] dark:shadow-[0_2px_10px_-3px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden bg-white dark:bg-slate-800 cursor-pointer flex flex-col justify-between group">
              
              <!-- Subtle top border accent instead of changing the whole card -->
              <div class="absolute top-0 left-0 w-full h-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300" [ngClass]="stat.gradientFrom.replace('from-', 'bg-')"></div>

              <!-- Decorative background flare -->
              <div [class]="'absolute top-0 right-0 w-48 h-48 -mr-16 -mt-16 rounded-full opacity-10 transition-transform duration-700 ease-in-out group-hover:scale-[1.3] ' + stat.gradientFrom.replace('from-', 'bg-')"></div>
              
              <app-card-content class="p-6 lg:p-7 h-full flex flex-col relative z-10 w-full">
                <!-- Header part: Title left, Icon right -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1 pr-4">
                    <h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                      {{ stat.title }}
                    </h3>
                    <div class="mt-2 text-5xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 transition-colors duration-300">
                      {{ stat.value }}
                    </div>
                  </div>
                  
                  <div [class]="'flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border border-white/50 backdrop-blur-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105 ' + stat.bgColor + ' ' + stat.color">
                    <ng-container [ngSwitch]="stat.icon">
                      <app-icon-users *ngSwitchCase="'users'" class="h-8 w-8"></app-icon-users>
                      <app-icon-clock *ngSwitchCase="'clock'" class="h-8 w-8"></app-icon-clock>
                      <app-icon-exclamation-triangle *ngSwitchCase="'exclamation'" class="h-8 w-8"></app-icon-exclamation-triangle>
                      <app-icon-megaphone *ngSwitchCase="'megaphone'" class="h-8 w-8"></app-icon-megaphone>
                      <app-icon-truck *ngSwitchCase="'truck'" class="h-8 w-8"></app-icon-truck>
                    </ng-container>
                  </div>
                </div>
                
                <!-- Footer area with underline effect and arrow -->
                <div class="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <!-- The Underline Text -->
                  <div class="inline-flex items-center group/link">
                    <span class="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 transition-colors duration-300 relative overflow-hidden pb-1">
                      View full report
                      <span class="absolute bottom-0 left-0 w-0 h-[2px] bg-indigo-600 transition-all duration-300 ease-out group-hover:w-full rounded-full"></span>
                    </span>
                  </div>

                  <!-- Arrow button -->
                  <div [class]="'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 opacity-60 group-hover:opacity-100 bg-slate-50 dark:bg-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30'">
                     <svg class="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </div>
              </app-card-content>
            </app-card>
          </a>
        </div>

        <!-- Recent Activities -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <!-- Recent Complaints -->
          <app-card class="rounded-2xl border-none shadow-sm dark:shadow-slate-900/50 overflow-hidden flex flex-col h-full bg-white dark:bg-slate-800">
            <app-card-header class="px-6 py-5 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <div class="flex items-center justify-between">
                <div>
                  <app-card-title class="text-lg font-bold text-slate-900 dark:text-white">Recent Complaints</app-card-title>
                  <app-card-description class="text-sm text-slate-500 dark:text-slate-400 font-medium">Issues needing attention</app-card-description>
                </div>
                <a routerLink="/admin/issues" class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">View All</a>
              </div>
            </app-card-header>
            <app-card-content class="p-0 flex-1">
              <div class="divide-y divide-slate-50 dark:divide-slate-700">
                <ng-container *ngIf="recentActivities?.complaints?.length > 0; else noComplaints">
                  <a *ngFor="let complaint of recentActivities.complaints" routerLink="/admin/issues" class="flex items-start p-5 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer group">
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 flex items-center justify-center text-orange-500 transition-colors">
                        <app-icon-exclamation-triangle class="h-5 w-5"></app-icon-exclamation-triangle>
                      </div>
                    </div>
                    <div class="ml-4 flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-0.5">
                        <p class="text-[15px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate pr-2">{{ complaint.title }}</p>
                        <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">{{ complaint.createdAt | date: 'MMM d' }}</span>
                      </div>
                      <p class="text-sm text-slate-500 dark:text-slate-400 mb-2 truncate">Raised by <span class="font-bold text-slate-700 dark:text-slate-300">{{ complaint.userId?.fullName }}</span></p>
                      <app-badge [variant]="getComplaintBadgeVariant(complaint.status)" class="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                        {{ complaint.status }}
                      </app-badge>
                    </div>
                  </a>
                </ng-container>
                <ng-template #noComplaints>
                  <div class="flex flex-col items-center justify-center py-12 px-6 text-center bg-slate-50/30 dark:bg-slate-800/30 m-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div class="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center text-emerald-400 mb-4 transform -rotate-6">
                       <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p class="text-base font-bold text-slate-900 dark:text-white">All caught up!</p>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">No recent complaints found</p>
                  </div>
                </ng-template>
              </div>
            </app-card-content>
          </app-card>

          <!-- Recent Residents -->
          <app-card class="rounded-2xl border-none shadow-sm dark:shadow-slate-900/50 overflow-hidden flex flex-col h-full bg-white dark:bg-slate-800">
            <app-card-header class="px-6 py-5 border-b border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <div class="flex items-center justify-between">
                <div>
                  <app-card-title class="text-lg font-bold text-slate-900 dark:text-white">Recent Registrations</app-card-title>
                  <app-card-description class="text-sm text-slate-500 dark:text-slate-400 font-medium">New community members</app-card-description>
                </div>
                <a routerLink="/admin/residents" class="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">View All</a>
              </div>
            </app-card-header>
            <app-card-content class="p-0 flex-1">
              <div class="divide-y divide-slate-50 dark:divide-slate-700">
                <ng-container *ngIf="recentActivities?.residents?.length > 0; else noResidents">
                  <a *ngFor="let resident of recentActivities.residents" [routerLink]="['/admin/residents']" class="flex items-start p-5 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer group">
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 flex items-center justify-center text-blue-600 transition-colors shadow-sm border border-blue-100/50 dark:border-blue-800/50">
                        <span class="font-extrabold text-sm">{{ resident.fullName.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="ml-4 flex-1 min-w-0">
                      <div class="flex items-center justify-between mb-0.5">
                        <p class="text-[15px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-2">{{ resident.fullName }}</p>
                        <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">{{ resident.createdAt | date: 'MMM d' }}</span>
                      </div>
                      <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 truncate">{{ resident.email }}</p>
                      <app-badge [variant]="getResidentBadgeVariant(resident.status)" class="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                        {{ resident.status }}
                      </app-badge>
                    </div>
                  </a>
                </ng-container>
                <ng-template #noResidents>
                  <div class="flex flex-col items-center justify-center py-12 px-6 text-center bg-slate-50/30 dark:bg-slate-800/30 m-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div class="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-400 mb-4 transform rotate-3">
                       <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <p class="text-base font-bold text-slate-900 dark:text-white">No recent activity</p>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">No new registrations recently</p>
                  </div>
                </ng-template>
              </div>
            </app-card-content>
          </app-card>
        </div>
      </ng-container>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  recentActivities: any = null;
  loading = true;
  statCards: any[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.apiService.getAdminDashboardStats().subscribe({
      next: (response: any) => {
        const { stats, recentActivities } = response.data;
        this.stats = stats;
        this.recentActivities = recentActivities;
        this.buildStatCards();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching dashboard data:', error);
        this.loading = false;
      },
    });
  }

  buildStatCards() {
    this.statCards = [
      {
        title: 'Total Residents',
        value: this.stats?.totalResidents || 0,
        icon: 'users',
        link: '/admin/residents',
        color: 'text-blue-600', bgColor: 'bg-blue-50', gradientFrom: 'from-blue-500', gradientTo: 'to-indigo-500',
      },
      {
        title: 'Pending Approvals',
        value: this.stats?.pendingResidents || 0,
        icon: 'clock',
        link: '/admin/residents',
        queryParams: { status: 'pending' },
        color: 'text-amber-600', bgColor: 'bg-amber-50', gradientFrom: 'from-amber-400', gradientTo: 'to-orange-500',
      },
      {
        title: 'Total Complaints',
        value: this.stats?.totalComplaints || 0,
        icon: 'exclamation',
        link: '/admin/issues',
        color: 'text-rose-600', bgColor: 'bg-rose-50', gradientFrom: 'from-rose-500', gradientTo: 'to-pink-500',
      },
      {
        title: 'Pending Complaints',
        value: this.stats?.pendingComplaints || 0,
        icon: 'clock',
        link: '/admin/issues',
        queryParams: { status: 'pending' },
        color: 'text-orange-600', bgColor: 'bg-orange-50', gradientFrom: 'from-orange-400', gradientTo: 'to-red-500',
      },
      {
        title: 'Active Notices',
        value: this.stats?.totalNotices || 0,
        icon: 'megaphone',
        link: '/admin/notices',
        color: 'text-emerald-600', bgColor: 'bg-emerald-50', gradientFrom: 'from-emerald-400', gradientTo: 'to-teal-500',
      },
      {
        title: 'Registered Vehicles',
        value: this.stats?.totalVehicles || 0,
        icon: 'truck',
        link: '/admin/vehicles',
        color: 'text-violet-600', bgColor: 'bg-violet-50', gradientFrom: 'from-violet-500', gradientTo: 'to-fuchsia-500',
      },
    ];
  }

  getComplaintBadgeVariant(status: string): BadgeVariant {
    if (status === 'pending') return 'warning';
    if (status === 'resolved') return 'success';
    return 'info';
  }

  getResidentBadgeVariant(status: string): BadgeVariant {
    if (status === 'pending') return 'warning';
    if (status === 'approved') return 'success';
    return 'error';
  }
}
