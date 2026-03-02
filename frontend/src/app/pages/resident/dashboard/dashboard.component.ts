import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
} from '../../../shared/components/ui/card/card.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';

import {
  IconUserCircleComponent,
  IconMegaphoneComponent,
  IconExclamationTriangleComponent,
  IconCheckCircleComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-resident-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    BadgeComponent,
    IconUserCircleComponent,
    IconMegaphoneComponent,
    IconExclamationTriangleComponent,
    IconCheckCircleComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Welcome back, {{ user?.fullName }}!
        </h1>
        <p class="text-gray-600">
          {{
            user?.wing && user?.flatNumber
              ? user.wing + '-' + user.flatNumber
              : 'Resident Dashboard'
          }}
        </p>
      </div>

      <div *ngIf="loading" class="flex items-center justify-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"
        ></div>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Status Card -->
        <app-card>
          <app-card-content class="p-6">
            <div class="flex items-center space-x-4">
              <div class="p-3 rounded-full bg-primary-100">
                <app-icon-user-circle
                  customClass="h-6 w-6 text-primary-600"
                ></app-icon-user-circle>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  Account Status
                </h3>
                <div class="flex items-center mt-1">
                  <app-badge
                    [variant]="
                      user?.status === 'approved' ? 'success' : 'warning'
                    "
                  >
                    {{ user?.status }}
                  </app-badge>
                  <span class="text-sm text-gray-500 ml-2">
                    {{
                      user?.status === 'approved'
                        ? 'You can access all features'
                        : 'Waiting for admin approval'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </app-card-content>
        </app-card>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <app-card>
            <app-card-content class="p-6">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-blue-100">
                  <app-icon-megaphone
                    customClass="h-6 w-6 text-blue-600"
                  ></app-icon-megaphone>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">
                    Active Notices
                  </p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ notices.length }}
                  </p>
                </div>
              </div>
            </app-card-content>
          </app-card>

          <app-card>
            <app-card-content class="p-6">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-red-100">
                  <app-icon-exclamation-triangle
                    customClass="h-6 w-6 text-red-600"
                  ></app-icon-exclamation-triangle>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">My Complaints</p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ complaints.length }}
                  </p>
                </div>
              </div>
            </app-card-content>
          </app-card>

          <app-card>
            <app-card-content class="p-6">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-green-100">
                  <app-icon-check-circle
                    customClass="h-6 w-6 text-green-600"
                  ></app-icon-check-circle>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">
                    Resolved Issues
                  </p>
                  <p class="text-2xl font-bold text-gray-900">
                    {{ getResolvedComplaintsCount() }}
                  </p>
                </div>
              </div>
            </app-card-content>
          </app-card>
        </div>

        <!-- Recent Activities -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <!-- Recent Notices -->
          <app-card>
            <app-card-header>
              <app-card-title>Recent Notices</app-card-title>
              <app-card-description
                >Latest announcements from the society</app-card-description
              >
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <ng-container *ngIf="notices.length > 0; else noNotices">
                  <div
                    *ngFor="let notice of notices"
                    class="flex items-start space-x-3"
                  >
                    <div class="flex-shrink-0">
                      <app-icon-megaphone
                        customClass="h-5 w-5 text-blue-500"
                      ></app-icon-megaphone>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ notice.title }}
                      </p>
                      <p class="text-sm text-gray-500 line-clamp-2">
                        {{ notice.description }}
                      </p>
                      <div class="flex items-center mt-1">
                        <app-badge variant="info">
                          {{ notice.priority || 'N/A' | titlecase }}
                        </app-badge>
                        <span class="text-xs text-gray-500 ml-2">
                          {{ notice.createdAt | date: 'shortDate' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </ng-container>
                <ng-template #noNotices>
                  <p class="text-sm text-gray-500">No recent notices</p>
                </ng-template>
              </div>
            </app-card-content>
          </app-card>

          <!-- My Recent Complaints -->
          <app-card>
            <app-card-header>
              <app-card-title>My Recent Complaints</app-card-title>
              <app-card-description
                >Your latest complaint submissions</app-card-description
              >
            </app-card-header>
            <app-card-content>
              <div class="space-y-4">
                <ng-container *ngIf="complaints.length > 0; else noComplaints">
                  <div
                    *ngFor="let complaint of complaints"
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
                      <p class="text-sm text-gray-500 line-clamp-2">
                        {{ complaint.description }}
                      </p>
                      <div class="flex items-center mt-1">
                        <app-badge [variant]="getStatusColor(complaint.status)">
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
                  <p class="text-sm text-gray-500">
                    No complaints submitted yet
                  </p>
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
  user: any = null;
  notices: any[] = [];
  complaints: any[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
  ) {}

  ngOnInit() {
    this.user = this.authService.currentState.user;
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    forkJoin({
      noticesRes: this.apiService.getResidentNotices({
        limit: 5,
        isActive: true,
      }),
      complaintsRes: this.apiService.getResidentComplaints({ limit: 5 }),
    }).subscribe({
      next: ({ noticesRes, complaintsRes }) => {
        this.notices = noticesRes.data?.notices || [];
        this.complaints = complaintsRes.data?.complaints || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching resident dashboard data:', error);
        this.loading = false;
      },
    });
  }

  getResolvedComplaintsCount(): number {
    return this.complaints.filter((c) => c.status === 'resolved').length;
  }

  getStatusColor(status: string): any {
    const normalizedStatus = status ? status.toLowerCase() : '';
    switch (normalizedStatus) {
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'in_progress':
      case 'in progress':
        return 'info';
      default:
        return 'default';
    }
  }
}
