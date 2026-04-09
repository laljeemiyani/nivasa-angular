import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';

import {
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
} from '../../../shared/components/ui/card/card.component';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import {
  ModalComponent,
  ModalHeaderComponent,
  ModalTitleComponent,
  ModalBodyComponent,
  ModalFooterComponent,
} from '../../../shared/components/ui/modal/modal.component';
import { IconXComponent } from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-admin-parking-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    BadgeComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    IconXComponent,
  ],
  templateUrl: './parking-requests.component.html',
})
export class AdminParkingRequestsComponent implements OnInit {
  loading = true;
  submitting = false;
  requests: any[] = [];
  statusFilter = '';

  // Stats
  stats = { pendingCount: 0, approvedCount: 0, rejectedCount: 0 };

  // Pagination
  currentPage = 1;
  totalPages = 1;
  total = 0;

  // Review modal
  isReviewModalOpen = false;
  selectedRequest: any = null;
  reviewAction: 'approve' | 'reject' = 'approve';
  adminNote = '';
  rejectionReason = '';

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.fetchRequests();
  }

  fetchRequests() {
    this.loading = true;
    const params: any = { page: this.currentPage, limit: 20 };
    if (this.statusFilter) params.status = this.statusFilter;

    this.http
      .get<any>(`${this.apiUrl}/parking/admin/requests`, { params })
      .subscribe({
        next: (response) => {
          this.requests = response.data.requests;
          this.stats = response.data.stats;
          this.totalPages = response.data.pagination.totalPages;
          this.total = response.data.pagination.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching parking requests:', error);
          this.loading = false;
        },
      });
  }

  onStatusFilterChange() {
    this.currentPage = 1;
    this.fetchRequests();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchRequests();
  }

  openReviewModal(request: any, action: 'approve' | 'reject') {
    this.selectedRequest = request;
    this.reviewAction = action;
    this.adminNote = '';
    this.rejectionReason = '';
    this.isReviewModalOpen = true;
  }

  closeReviewModal() {
    this.isReviewModalOpen = false;
    this.selectedRequest = null;
  }

  submitReview() {
    if (this.reviewAction === 'reject' && !this.rejectionReason.trim()) {
      this.toastService.warning('Validation Error', 'Rejection reason is required.');
      return;
    }

    this.submitting = true;
    const body: any = {
      action: this.reviewAction,
      adminNote: this.adminNote || undefined,
    };
    if (this.reviewAction === 'reject') {
      body.rejectionReason = this.rejectionReason;
    }

    this.http
      .put(
        `${this.apiUrl}/parking/admin/request/${this.selectedRequest._id}`,
        body,
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            this.reviewAction === 'approve' ? 'Request Approved' : 'Request Rejected',
            this.reviewAction === 'approve' 
              ? 'The parking request has been approved.' 
              : 'The parking request has been rejected.'
          );
          this.closeReviewModal();
          this.fetchRequests();
          this.submitting = false;
        },
        error: (err) => {
          console.error(err);
          this.toastService.error('Error', err.error?.message || 'Failed to process request');
          this.submitting = false;
        },
      });
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  }
}
