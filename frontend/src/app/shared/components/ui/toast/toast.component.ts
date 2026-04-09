import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ToastService, Toast } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[80] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <div 
        *ngFor="let toast of toasts; let i = index"
        class="pointer-events-auto transform transition-all duration-300 ease-out animate-slide-in"
        [style.animation-delay]="i * 50 + 'ms'"
      >
        <div 
          class="rounded-xl shadow-lg border overflow-hidden"
          [ngClass]="getToastClasses(toast.type)"
        >
          <div class="p-4">
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div class="flex-shrink-0 mt-0.5">
                <ng-container [ngSwitch]="toast.type">
                  <svg *ngSwitchCase="'success'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg *ngSwitchCase="'error'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <svg *ngSwitchCase="'warning'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <svg *ngSwitchDefault class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </ng-container>
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold" [ngClass]="getTitleClass(toast.type)">
                  {{ toast.title }}
                </p>
                <p *ngIf="toast.message" class="mt-1 text-sm opacity-90">
                  {{ toast.message }}
                </p>
              </div>
              
              <!-- Close button -->
              <button 
                *ngIf="toast.dismissible"
                (click)="dismiss(toast.id)"
                class="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((toasts: Toast[]) => {
        this.toasts = toasts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  getToastClasses(type: string): string {
    const classes: Record<string, string> = {
      success: 'bg-green-50 dark:bg-green-900/90 border-green-200 dark:border-green-700 text-green-800 dark:text-green-100',
      error: 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100',
      warning: 'bg-amber-50 dark:bg-amber-900/90 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-100',
      info: 'bg-blue-50 dark:bg-blue-900/90 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100'
    };
    return classes[type] || classes['info'];
  }

  getTitleClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'text-green-800 dark:text-green-100',
      error: 'text-red-800 dark:text-red-100',
      warning: 'text-amber-800 dark:text-amber-100',
      info: 'text-blue-800 dark:text-blue-100'
    };
    return classes[type] || classes['info'];
  }
}
