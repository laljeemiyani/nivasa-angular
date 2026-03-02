import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

// Layouts
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ResidentLayoutComponent } from './layouts/resident-layout/resident-layout.component';

// Features
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login', // User will be redirected by Auth service/guard if already logged in. Actually, in login component, we navigate them out.
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { requiredRole: 'admin' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'residents',
        loadComponent: () =>
          import('./pages/admin/residents/residents.component').then(
            (m) => m.AdminResidentsComponent,
          ),
      },
      {
        path: 'family-members',
        loadComponent: () =>
          import('./pages/admin/family-members/family-members.component').then(
            (m) => m.AdminFamilyMembersComponent,
          ),
      },
      {
        path: 'vehicles',
        loadComponent: () =>
          import('./pages/admin/vehicles/vehicles.component').then(
            (m) => m.AdminVehiclesComponent,
          ),
      },
      {
        path: 'notices',
        loadComponent: () =>
          import('./pages/admin/notices/notices.component').then(
            (m) => m.AdminNoticesComponent,
          ),
      },
      {
        path: 'issues', // The request used "Issues", but the component is Complaints. I'll use complaints in the URL as well to match React, but the user said "Issues". React URL was /admin/complaints actually? Let's check React's App.jsx. Let's use 'complaints'.
        loadComponent: () =>
          import('./pages/admin/complaints/complaints.component').then(
            (m) => m.AdminComplaintsComponent,
          ),
      },
      {
        path: 'complaints',
        redirectTo: 'issues', // Just in case
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/admin/notifications/notifications.component').then(
            (m) => m.AdminNotificationsComponent,
          ),
      },
    ],
  },
  {
    path: 'resident',
    component: ResidentLayoutComponent,
    canActivate: [AuthGuard],
    data: { requiredRole: 'resident' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/resident/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/resident/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
      {
        path: 'family',
        loadComponent: () =>
          import('./pages/resident/family/family.component').then(
            (m) => m.FamilyComponent,
          ),
      },
      {
        path: 'vehicles',
        loadComponent: () =>
          import('./pages/resident/vehicles/vehicles.component').then(
            (m) => m.ResidentVehiclesComponent,
          ),
      },
      {
        path: 'notices',
        loadComponent: () =>
          import('./pages/resident/notices/notices.component').then(
            (m) => m.ResidentNoticesComponent,
          ),
      },
      {
        path: 'issues',
        loadComponent: () =>
          import('./pages/resident/complaints/complaints.component').then(
            (m) => m.ResidentComplaintsComponent,
          ),
      },
      {
        path: 'complaints',
        redirectTo: 'issues',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/resident/notifications/notifications.component').then(
            (m) => m.ResidentNotificationsComponent,
          ),
      },
    ],
  },
  {
    path: 'unauthorized',
    redirectTo: '/login',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
