import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
} from '../../../shared/components/ui/card/card.component';

@Component({
  selector: 'app-admin-client-profile',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Client Profile</h1>
        <p class="text-gray-600 mt-1">Manage society and client information</p>
      </div>

      <app-card>
        <app-card-header>
          <app-card-title>Client Profile</app-card-title>
          <app-card-description
            >View and manage client details</app-card-description
          >
        </app-card-header>
        <app-card-content>
          <div
            class="flex flex-col items-center justify-center h-48 text-center px-4"
          >
            <div class="bg-gray-100 p-4 rounded-full mb-4">
              <svg
                class="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">
              Client Profile
            </h3>
            <p class="text-gray-500 text-sm">
              Client profile management coming soon.
            </p>
          </div>
        </app-card-content>
      </app-card>
    </div>
  `,
})
export class AdminClientProfileComponent {}
