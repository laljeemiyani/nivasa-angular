import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
} from '../../../shared/components/ui/card/card.component';

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
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    IconCheckComponent,
    IconTrashComponent,
    IconAlertCircleComponent,
    IconChevronLeftComponent,
    IconChevronRightComponent,
    IconUserComponent,
  ],
  templateUrl: './notifications.component.html',
})
export class AdminNotificationsComponent implements OnInit {
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.loading = true;
    let params: any = { page: this.page.toString(), limit: '10' };

    if (this.filter.isRead) params.isRead = this.filter.isRead;
    if (this.filter.type) params.type = this.filter.type;
    if (this.filter.relatedModel)
      params.relatedModel = this.filter.relatedModel;

    this.http.get<any>(`${this.apiUrl}/notifications`, { params }).subscribe({
      next: (response) => {
        this.notifications =
          response.data?.notifications ||
          response.data?.data?.notifications ||
          [];
        const pagination = response.data?.pagination ||
          response.data?.data?.pagination || { totalPages: 1, totalItems: 0 };
        this.totalPages = pagination.totalPages;
        this.totalItems = pagination.totalItems;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to fetch notifications:', error);
        this.loading = false;
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

  handleDeleteNotification(id: string) {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    this.http.delete(`${this.apiUrl}/notifications/${id}`).subscribe({
      next: () => {
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
      },
    });
  }

  handleMarkAllAsRead() {
    this.http.put(`${this.apiUrl}/notifications/mark-all-read`, {}).subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
      },
    });
  }

  getNotificationTypeClass(type: string) {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
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
