import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-resident-notifications',
  standalone: true,
  imports: [
    CommonModule,
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
  ],
  templateUrl: './notifications.component.html',
})
export class ResidentNotificationsComponent implements OnInit {
  notifications$!: Observable<any[]>;
  loading = true;
  page = 1;
  totalPages = 1;
  totalItems = 0;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.notifications$ = this.notificationService.notifications$;
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.loading = true;
    let params: any = { page: this.page.toString(), limit: '10' };

    this.notificationService.fetchMyNotifications(params);

    // Give the subject a moment to emit and smooth out the UI
    setTimeout(() => {
      this.loading = false;
    }, 300);
  }

  setPage(p: number) {
    if (p < 1) return;
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
        this.fetchNotifications();
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      },
    });
  }

  handleDeleteNotification(id: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (!confirm('Are you sure you want to delete this notification?')) return;
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.fetchNotifications();
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      },
    });
  }

  handleMarkAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.fetchNotifications();
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

  handleNotificationClick(notification: any) {
    // 1. Mark as read if it is unread
    if (!notification.isRead) {
      // Optimistically update the UI to feel snappy
      notification.isRead = true;
      this.notificationService.markAsRead(notification._id).subscribe({
        next: () => {
          // If we wanted to refresh completely we could call fetchNotifications()
        },
        error: (error) => {
          console.error('Failed to mark notification as read on click:', error);
          // Revert optimistic update on failure (optional, but good UX)
          notification.isRead = false;
        },
      });
    }

    // 2. Perform Router Navigation based on routingType
    switch (notification.routingType) {
      case 'COMPLAINT_UPDATE':
        this.router.navigate(['/resident/complaints']);
        // If your complaints page accepts query params or URL params for referenceId,
        // you would append it here, e.g. this.router.navigate(['/resident/complaints', notification.referenceId])
        break;
      case 'PARKING_REQUEST':
        this.router.navigate(['/resident/vehicles']);
        break;
      case 'BROADCAST':
      case 'SYSTEM':
      default:
        // Do nothing for these types
        break;
    }
  }
}
