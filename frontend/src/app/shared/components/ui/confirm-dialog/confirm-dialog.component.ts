import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmDialogService, ConfirmState } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="state.isOpen" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
        (click)="onCancel()"
      ></div>
      
      <!-- Dialog -->
      <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-700">
        <!-- Content -->
        <div class="p-6 text-center">
          <!-- Icon -->
          <div 
            class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 border"
            [ngClass]="getIconClasses()"
          >
            <ng-container [ngSwitch]="state.icon || state.type">
              <svg *ngSwitchCase="'trash'" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <svg *ngSwitchCase="'logout'" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <svg *ngSwitchCase="'warning'" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg *ngSwitchDefault class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </ng-container>
          </div>
          
          <!-- Title -->
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {{ state.title }}
          </h3>
          
          <!-- Message -->
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium px-2 leading-relaxed">
            {{ state.message }}
          </p>
        </div>
        
        <!-- Actions -->
        <div class="px-6 py-4 bg-slate-50/80 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3 flex-col-reverse sm:flex-row">
          <button 
            (click)="onCancel()"
            type="button"
            class="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 shadow-sm"
          >
            {{ state.cancelText }}
          </button>
          <button 
            (click)="onConfirm()"
            type="button"
            class="w-full sm:flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            [ngClass]="getConfirmButtonClasses()"
          >
            {{ state.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    
    .animate-scale-in {
      animation: scaleIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  state: ConfirmState = {
    isOpen: false,
    message: '',
    title: 'Confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info'
  };
  
  private destroy$ = new Subject<void>();

  constructor(private confirmDialogService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.confirmDialogService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: ConfirmState) => {
        this.state = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onConfirm(): void {
    this.confirmDialogService.resolve(true);
  }

  onCancel(): void {
    this.confirmDialogService.resolve(false);
  }

  getIconClasses(): string {
    const baseClasses = 'relative';
    const typeClasses: Record<string, string> = {
      danger: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50 text-red-500',
      warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50 text-amber-500',
      success: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50 text-green-500',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50 text-blue-500'
    };
    return `${baseClasses} ${typeClasses[this.state.type || 'info']}`;
  }

  getConfirmButtonClasses(): string {
    const typeClasses: Record<string, string> = {
      danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/30',
      warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 shadow-amber-500/30',
      success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-green-500/30',
      info: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 shadow-primary-500/30'
    };
    return typeClasses[this.state.type || 'info'];
  }
}
