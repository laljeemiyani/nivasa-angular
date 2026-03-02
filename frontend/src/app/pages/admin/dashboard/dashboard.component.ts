import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="text-gray-600">
          Welcome to the Nivasa Society Management System
        </p>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"
        ></div>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-card *ngFor="let stat of statCards" class="card-hover">
            <app-card-content class="p-6">
              <div class="flex items-center">
                <div [class]="'p-3 rounded-full ' + stat.bgColor">
                  <ng-container [ngSwitch]="stat.icon">
                    <app-icon-users
                      *ngSwitchCase="'users'"
                      [customClass]="'h-6 w-6 ' + stat.color"
                    ></app-icon-users>
                    <app-icon-clock
                      *ngSwitchCase="'clock'"
                      [customClass]="'h-6 w-6 ' + stat.color"
                    ></app-icon-clock>
                    <app-icon-exclamation-triangle
                      *ngSwitchCase="'exclamation'"
                      [customClass]="'h-6 w-6 ' + stat.color"
                    ></app-icon-exclamation-triangle>
                    <app-icon-megaphone
                      *ngSwitchCase="'megaphone'"
                      [customClass]="'h-6 w-6 ' + stat.color"
                    ></app-icon-megaphone>
                    <app-icon-truck
                      *ngSwitchCase="'truck'"
                      [customClass]="'h-6 w-6 ' + stat.color"
                    ></app-icon-truck>
                  </ng-container>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">
                    {{ stat.title }}
                  </p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ stat.value }}
                  </p>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Recent Activities -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <!-- Recent Complaints -->
          <app-card>
            <app-card-header>
              <app-card-title>Recent Complaints</app-card-title>
              <app-card-description
                >Latest complaints from residents</app-card-description
              >
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <ng-container
                  *ngIf="
                    recentActivities?.complaints?.length > 0;
                    else noComplaints
                  "
                >
                  <div
                    *ngFor="let complaint of recentActivities.complaints"
                    class="flex items-start space-x-3"
                  >
                    <div class="flex-shrink-0">
                      <app-icon-exclamation-triangle
                        customClass="h-5 w-5 text-red-500"
                      ></app-icon-exclamation-triangle>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ complaint.title }}
                      </p>
                      <p class="text-sm text-gray-500">
                        by {{ complaint.userId?.fullName }}
                      </p>
                      <div class="flex items-center mt-1">
                        <app-badge
                          [variant]="getComplaintBadgeVariant(complaint.status)"
                        >
                          {{ complaint.status }}
                        </app-badge>
                        <span class="text-xs text-gray-500 ml-2">
                          {{ complaint.createdAt | date: 'shortDate' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </ng-container>
                <ng-template #noComplaints>
                  <p class="text-sm text-gray-500">No recent complaints</p>
                </ng-template>
              </div>
            </app-card-content>
          </app-card>

          <!-- Recent Residents -->
          <app-card>
            <app-card-header>
              <app-card-title>Recent Registrations</app-card-title>
              <app-card-description
                >Latest resident registrations</app-card-description
              >
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <ng-container
                  *ngIf="
                    recentActivities?.residents?.length > 0;
                    else noResidents
                  "
                >
                  <div
                    *ngFor="let resident of recentActivities.residents"
                    class="flex items-start space-x-3"
                  >
                    <div class="flex-shrink-0">
                      <app-icon-users
                        customClass="h-5 w-5 text-blue-500"
                      ></app-icon-users>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ resident.fullName }}
                      </p>
                      <p class="text-sm text-gray-500">{{ resident.email }}</p>
                      <div class="flex items-center mt-1">
                        <app-badge
                          [variant]="getResidentBadgeVariant(resident.status)"
                        >
                          {{ resident.status }}
                        </app-badge>
                        <span class="text-xs text-gray-500 ml-2">
                          {{ resident.createdAt | date: 'shortDate' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </ng-container>
                <ng-template #noResidents>
                  <p class="text-sm text-gray-500">No recent registrations</p>
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

  constructor(private apiService: ApiService) {}

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
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Pending Approvals',
        value: this.stats?.pendingResidents || 0,
        icon: 'clock',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      },
      {
        title: 'Total Complaints',
        value: this.stats?.totalComplaints || 0,
        icon: 'exclamation',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      },
      {
        title: 'Pending Complaints',
        value: this.stats?.pendingComplaints || 0,
        icon: 'clock',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      },
      {
        title: 'Active Notices',
        value: this.stats?.activeNotices || 0,
        icon: 'megaphone',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        title: 'Registered Vehicles',
        value: this.stats?.totalVehicles || 0,
        icon: 'truck',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
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
