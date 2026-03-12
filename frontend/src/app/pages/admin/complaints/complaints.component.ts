import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

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

import {
  IconEyeComponent,
  IconCheckComponent,
  IconXComponent,
  IconTrashComponent,
  IconChevronLeftComponent,
  IconChevronRightComponent,
  IconClockComponent,
} from '../../../shared/components/ui/icons/icons.component';

@Component({
  selector: 'app-admin-complaints',
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
    IconEyeComponent,
    IconCheckComponent,
    IconXComponent,
    IconTrashComponent,
    IconChevronLeftComponent,
    IconChevronRightComponent,
    IconClockComponent,
  ],
  templateUrl: './complaints.component.html',
})
export class AdminComplaintsComponent implements OnInit {
  complaints: any[] = [];
  loading = false;
  page = 1;
  totalPages = 1;

  statusFilter = '';
  categoryFilter = '';

  selectedComplaint: any = null;
  modalOpen = false;
  actionStatus = '';
  adminResponse = '';
  actionLoading = false;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private confirmDialogService: ConfirmDialogService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const statusFromQuery = this.route.snapshot.queryParamMap.get('status');
    if (statusFromQuery) {
      this.statusFilter = statusFromQuery.toLowerCase();
    }
    this.fetchComplaints();
  }

  fetchComplaints() {
    this.loading = true;
    let params: any = { page: this.page.toString(), limit: '10' };

    if (this.statusFilter) params.status = this.statusFilter;
    if (this.categoryFilter) params.category = this.categoryFilter;

    this.http
      .get<any>(`${this.apiUrl}/admin/complaints`, { params })
      .subscribe({
        next: (response) => {
          this.complaints =
            response.data?.complaints || response.data?.data?.complaints || [];
          this.totalPages =
            response.data?.pagination?.totalPages ||
            response.data?.data?.pagination?.totalPages ||
            1;
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to fetch complaints:', error);
          this.loading = false;
        },
      });
  }

  onFilterChange() {
    this.page = 1;
    this.fetchComplaints();
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.fetchComplaints();
  }

  openModal(complaint: any, status: string) {
    this.selectedComplaint = complaint;
    this.actionStatus = status;
    this.adminResponse = complaint.adminResponse || '';
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedComplaint = null;
    this.actionStatus = '';
    this.adminResponse = '';
  }

  handleStatusUpdate() {
    if (!this.selectedComplaint) return;

    if (
      ['in_progress', 'resolved'].includes(this.actionStatus) &&
      !this.adminResponse.trim()
    ) {
      this.toastService.warning('Validation Error', 'Please provide a response for the resident');
      return;
    }

    this.actionLoading = true;

    this.http
      .put(
        `${this.apiUrl}/admin/complaints/${this.selectedComplaint._id}/status`,
        {
          status: this.actionStatus,
          adminResponse: this.adminResponse,
        },
      )
      .subscribe({
        next: () => {
          this.toastService.success('Status Updated', 'Complaint status has been updated successfully.');
          this.fetchComplaints();
          this.closeModal();
          this.actionLoading = false;
        },
        error: (error) => {
          console.error('Failed to update complaint status:', error);
          this.toastService.error('Error', error.error?.message || 'Failed to update complaint status');
          this.actionLoading = false;
        },
      });
  }

  async handleDelete(complaintId: string) {
    const confirmed = await this.confirmDialogService.confirmDelete('this complaint');
    if (!confirmed) return;

    this.http
      .delete(`${this.apiUrl}/admin/complaints/${complaintId}`)
      .subscribe({
        next: () => {
          this.toastService.success('Complaint Deleted', 'The complaint has been deleted successfully.');
          this.fetchComplaints();
        },
        error: (error) => {
          console.error('Failed to delete complaint:', error);
          this.toastService.error('Error', error.error?.message || 'Failed to delete complaint');
        },
      });
  }

  getStatusBadgeVariant(status: string) {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getPriorityBadgeVariant(priority: string) {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
}
