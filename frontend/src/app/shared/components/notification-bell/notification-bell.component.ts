import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { formatDistanceToNow } from 'date-fns';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    
    <div class="relative">
      <button
        (click)="toggleDropdown()"
        class="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span *ngIf="unreadCount > 0" class="absolute top-1 right-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <div *ngIf="isOpen" class="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[60] animate-fade-in-down origin-top-right">
        <div class="px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 class="text-base font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h3>
          <button *ngIf="unreadCount > 0" (click)="handleMarkAllAsRead()" class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 px-2.5 py-1 rounded-full">
            Mark all read
          </button>
        </div>

        <div class="max-h-[25rem] overflow-y-auto">
          <div *ngIf="isLoading" class="py-12 flex justify-center items-center">
             <div class="w-6 h-6 border-2 border-slate-200 dark:border-slate-700 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          </div>

          <div *ngIf="!isLoading && notifications.length > 0" class="divide-y divide-slate-100 dark:divide-slate-700">
            <div *ngFor="let notification of notifications" class="px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer group" [ngClass]="{ 'bg-primary-50/50 dark:bg-primary-900/10': !notification.isRead }" (click)="toggleExpand(notification._id, $event)">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center text-lg" [ngClass]="{
                   'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': notification.type === 'success',
                   'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400': notification.type === 'warning',
                   'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400': notification.type === 'error',
                   'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400': notification.type !== 'success' && notification.type !== 'warning' && notification.type !== 'error'
                }">
                  {{ getNotificationIcon(notification.type) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start gap-2 mb-1">
                     <p class="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                       {{ notification.title }}
                     </p>
                     <div *ngIf="!notification.isRead" class="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full mt-1 shrink-0"></div>
                  </div>
                  
                  <p class="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed transition-all duration-300" 
                     [ngClass]="expandedId === notification._id ? 'line-clamp-none' : 'line-clamp-2'">
                    {{ notification.message }}
                  </p>
                  
                  <div class="flex items-center justify-between mt-2">
                     <p class="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                       {{ timeAgo(notification.createdAt) }}
                     </p>
                     <span *ngIf="expandedId !== notification._id" class="text-[10px] font-semibold text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">Click to expand</span>
                     <span *ngIf="expandedId === notification._id" class="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Click to collapse</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="!isLoading && notifications.length === 0" class="py-12 px-6 text-center">
            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
               <svg class="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <p class="text-base font-semibold text-slate-900 dark:text-white">All caught up!</p>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Check back later for new alerts.</p>
          </div>
        </div>

        <div class="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
          <button (click)="navigateToNotifications()"
             class="block w-full text-center py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors cursor-pointer">
            View all notifications →
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in-down {
        animation: fadeInDown 0.2s ease-out;
      }
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  expandedId: string | null = null;
  notifications: any[] = [];
  unreadCount = 0;
  isOpen = false;
  isLoading = false;
  userRole: string | null = null;

  private pollingSub?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private eRef: ElementRef,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.state$.subscribe((state) => {
      this.userRole = state.user?.role || null;
    });

    this.fetchNotifications();

    // Poll every 30s for near real-time updates (e.g. new registration, approval)
    this.pollingSub = interval(30000).subscribe(() => {
      if (!this.isOpen) {
        this.fetchNotifications();
      }
    });
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  @HostListener('document:mousedown', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.setIsOpen(false);
    }
  }

  fetchNotifications() {
    this.isLoading = true;
    this.notificationService.getNotifications({ page: 1, limit: 5 }).subscribe({
      next: (res) => {
        this.notifications = res.data.notifications || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
        this.isLoading = false;
      },
    });

    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res.data.count || 0;
      },
      error: (err) => console.error('Error fetching unread count:', err),
    });
  }

  toggleExpand(id: string, event: Event) {
    event.stopPropagation();
    this.expandedId = this.expandedId === id ? null : id;
    const notification = this.notifications.find(n => n._id === id);
    if (notification && !notification.isRead) {
      this.handleMarkAsRead(id);
    }
  }

  handleMarkAsRead(id: string) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n,
        );
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: (err) => console.error('Error marking as read:', err),
    });
  }

  handleMarkAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
        this.unreadCount = 0;
      },
      error: (err) => console.error('Error marking all as read:', err),
    });
  }

  toggleDropdown() {
    this.setIsOpen(!this.isOpen);
  }

  setIsOpen(value: boolean) {
    this.isOpen = value;
    if (!value) {
      this.fetchNotifications();
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '!';
      case 'error': return '✕';
      default: return 'i';
    }
  }

  timeAgo(dateString: string): string {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  }

  navigateToNotifications() {
    this.setIsOpen(false);
    const route = this.userRole === 'admin' ? '/admin/notifications' : '/resident/notifications';
    this.router.navigate([route]);
  }
}
