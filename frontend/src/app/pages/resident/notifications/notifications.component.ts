import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import {
  IconCheckComponent,
  IconTrashComponent,
  IconChevronLeftComponent,
  IconChevronRightComponent,
  IconAlertCircleComponent
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-resident-notifications',
  standalone: true,
  imports: [
    CommonModule,
    IconCheckComponent,
    IconTrashComponent,
    IconChevronLeftComponent,
    IconChevronRightComponent,
    IconAlertCircleComponent
  ],
  templateUrl: './notifications.component.html',
})
export class ResidentNotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  loading = true;
  page = 1;
  totalPages = 1;
  totalItems = 0;
  private pollingSub?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService,
    private confirmDialogService: ConfirmDialogService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchNotifications();
    // Poll every 30s so approval/rejection updates appear without full page refresh
    this.pollingSub = interval(30000).subscribe(() => this.refreshSilent());
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }

  fetchNotifications() {
    this.loading = true;
    this.doFetch(true);
  }

  /** Background refresh without loading spinner (for polling). */
  private refreshSilent() {
    this.doFetch(false);
  }

  private doFetch(showLoading: boolean) {
    if (showLoading) this.loading = true;
    const params: any = { page: this.page.toString(), limit: '10' };
    this.notificationService.getNotifications(params).subscribe({
      next: (response) => {
        this.notifications = response.data?.notifications || response.data?.data?.notifications || [];
        const pagination = response.data?.pagination || response.data?.data?.pagination || { totalPages: 1, totalItems: 0 };
        this.totalPages = pagination.totalPages;
        this.totalItems = pagination.totalItems;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to fetch notifications:', error);
        this.loading = false;
      }
    });
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.fetchNotifications();
  }

  getPages() {
    const pages = [];
    for (let i = 0; i < Math.min(5, this.totalPages); i++) {
      let pageNum = this.page - 2 + i;
      if (pageNum >= 1 && pageNum <= this.totalPages) {
        pages.push(pageNum);
      }
    }
    return pages;
  }

  handleMarkAsRead(id: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      },
    });
  }

  async handleDeleteNotification(id: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    const confirmed = await this.confirmDialogService.confirmDelete('this notification');
    if (!confirmed) return;
    
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.toastService.success('Notification Deleted', 'The notification has been deleted successfully.');
        this.notifications = this.notifications.filter((n) => n._id !== id);
        this.totalItems = Math.max(0, this.totalItems - 1);
        if (this.notifications.length === 0 && this.page > 1) {
          this.setPage(this.page - 1);
        } else {
          this.fetchNotifications();
        }
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
        this.toastService.error('Error', 'Failed to delete notification');
      },
    });
  }

  handleMarkAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.toastService.success('Success', 'All notifications marked as read.');
        this.notifications = this.notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.toastService.error('Error', 'Failed to mark all notifications as read');
      },
    });
  }

  getNotificationTypeClass(type: string) {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  }

  getNotificationIconStyle(type: string) {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-slate-500';
    }
  }

  getNotificationIcon(type: string) {
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

  formatDate(dateString: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
