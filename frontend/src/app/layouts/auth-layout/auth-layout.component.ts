import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-2xl w-full space-y-8">
        <!-- Logo section -->
        <div class="text-center">
          <div
            class="mx-auto h-20 w-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center shadow-lg"
          >
            <span class="text-3xl font-bold text-white">N</span>
          </div>
          <h2 class="mt-6 text-4xl font-bold text-gray-900">Nivasa Society</h2>
          <p class="mt-2 text-lg text-gray-600">Management System</p>
        </div>

        <!-- Form Outlet -->
        <div
          class="bg-white py-10 px-8 shadow-2xl rounded-2xl border border-gray-100"
        >
          <!-- The Login or Register component will be projected here -->
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
