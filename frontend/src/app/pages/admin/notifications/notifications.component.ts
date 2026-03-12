import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { interval, Subscription } from 'rxjs';


import {
  IconCheckComponent,
  IconTrashComponent,
  IconAlertCircleComponent,
  IconChevronLeftComponent,
  IconChevronRightComponent,
  IconUserComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconCheckComponent,
    IconTrashComponent,
    IconAlertCircleComponent,
    IconChevronLeftComponent,
    IconChevronRightComponent,
    IconUserComponent,
  ],
  templateUrl: './notifications.component.html',
})
export class AdminNotificationsComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  loading = true;
  page = 1;
  totalPages = 1;
  totalItems = 0;

  filter = {
    isRead: '',
    type: '',
    relatedModel: '',
  };

  private apiUrl = environment.apiUrl;
  private pollingSub?: Subscription;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private confirmDialogService: ConfirmDialogService,
  ) { }

  ngOnInit() {
    this.fetchNotifications();
    // Poll every 30s so new registrations and updates appear without full page refresh
    this.pollingSub = interval(30000).subscribe(() => this.refreshSilent());
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }

  fetchNotifications() {
    this.loading = true;
    this.doFetch((response) => {
      this.notifications =
        response.data?.notifications ||
        response.data?.data?.notifications ||
        [];
      const pagination = response.data?.pagination ||
        response.data?.data?.pagination || { totalPages: 1, totalItems: 0 };
      this.totalPages = pagination.totalPages;
      this.totalItems = pagination.totalItems;
      this.loading = false;
    }, () => { this.loading = false; });
  }

  /** Refresh list in background without showing loading (for polling). */
  private refreshSilent() {
    this.doFetch((response) => {
      this.notifications =
        response.data?.notifications ||
        response.data?.data?.notifications ||
        [];
      const pagination = response.data?.pagination ||
        response.data?.data?.pagination || { totalPages: 1, totalItems: 0 };
      this.totalPages = pagination.totalPages;
      this.totalItems = pagination.totalItems;
    }, () => {});
  }

  private doFetch(
    onSuccess: (response: any) => void,
    onError: () => void,
  ) {
    let params: any = { page: this.page.toString(), limit: '10' };
    if (this.filter.isRead) params.isRead = this.filter.isRead;
    if (this.filter.type) params.type = this.filter.type;
    if (this.filter.relatedModel) params.relatedModel = this.filter.relatedModel;

    this.http.get<any>(`${this.apiUrl}/notifications`, { params }).subscribe({
      next: onSuccess,
      error: (err) => {
        console.error('Failed to fetch notifications:', err);
        onError();
      },
    });
  }

  onFilterChange() {
    this.page = 1;
    this.fetchNotifications();
  }

  clearFilters() {
    this.filter = { isRead: '', type: '', relatedModel: '' };
    this.page = 1;
    this.fetchNotifications();
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

  handleMarkAsRead(id: string) {
    this.http.put(`${this.apiUrl}/notifications/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n,
        );
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      },
    });
  }

  async handleDeleteNotification(id: string) {
    const confirmed = await this.confirmDialogService.confirmDelete('this notification');
    if (!confirmed) return;
    
    this.http.delete(`${this.apiUrl}/notifications/${id}`).subscribe({
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
        this.toastService.error('Error', error.error?.message || 'Failed to delete notification');
      },
    });
  }

  handleMarkAllAsRead() {
    this.http.put(`${this.apiUrl}/notifications/mark-all-read`, {}).subscribe({
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
      case 'new_registration':
        return 'bg-indigo-500/10 border-indigo-500/30';
      case 'status_update':
        return 'bg-primary-500/10 border-primary-500/30';
      default:
        return 'bg-primary-500/10 border-primary-500/30';
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
      case 'new_registration':
        return 'text-indigo-500';
      case 'status_update':
        return 'text-primary-500';
      default:
        return 'text-blue-500';
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
      case 'new_registration':
        return '👤';
      case 'status_update':
        return '📋';
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
