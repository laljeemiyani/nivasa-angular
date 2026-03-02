import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
        class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span
          *ngIf="unreadCount > 0"
          class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <div
        *ngIf="isOpen"
        class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 animate-fade-in-down border border-gray-200"
      >
        <div class="py-2 px-3 bg-gray-100 flex justify-between items-center">
          <h3 class="text-sm font-medium text-gray-900">Notifications</h3>
          <button
            *ngIf="unreadCount > 0"
            (click)="handleMarkAllAsRead()"
            class="text-xs text-primary-600 hover:text-primary-800"
          >
            Mark all as read
          </button>
        </div>

        <div class="max-h-96 overflow-y-auto">
          <div *ngIf="isLoading" class="py-4 text-center text-gray-500">
            Loading...
          </div>

          <div *ngIf="!isLoading && notifications.length > 0">
            <div
              *ngFor="let notification of notifications"
              class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              [ngClass]="{ 'bg-blue-50': !notification.isRead }"
              (click)="
                !notification.isRead && handleMarkAsRead(notification._id)
              "
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mr-2">
                  {{ getNotificationIcon(notification.type) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">
                    {{ notification.title }}
                  </p>
                  <p class="text-sm text-gray-500 truncate">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ timeAgo(notification.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            *ngIf="!isLoading && notifications.length === 0"
            class="py-4 text-center text-gray-500"
          >
            No notifications
          </div>
        </div>

        <div class="py-2 px-3 bg-gray-100 text-center">
          <a
            [routerLink]="
              userRole === 'admin'
                ? '/admin/notifications'
                : '/resident/notifications'
            "
            class="text-xs text-primary-600 hover:text-primary-800"
            (click)="setIsOpen(false)"
          >
            View all notifications
          </a>
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
  ) {}

  ngOnInit() {
    this.authService.state$.subscribe((state) => {
      this.userRole = state.user?.role || null;
    });

    this.fetchNotifications();

    // Poll every 60s
    this.pollingSub = interval(60000).subscribe(() => {
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
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  }

  timeAgo(dateString: string): string {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  }
}
